##
# This script exports the pre-generated USIs in chunks into CSV files for School to import
# Author: Eric Wu (EW2848)
# Remarks:
#   1. This script should be run on VET DB for testing purposes.
#   2. This script is part of a simulation of a fully functioning ADF transmitting data from VET to EDT.
#   3. This script must not be used in PROD and/or when the ADF functionality is in place.
##
[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [string]$server = ".",
  [Parameter(Mandatory)]
  [string]$database = "USI"
)
begin {
  $ErrorActionPreference = "Stop"
  $InformationPreference = "Continue"
  $table = "[$database].[dbo].[USIReservedList]"
  $totalRowsQuery = "SELECT COUNT(*) FROM $table"
  $totalRowsCmd = "sqlcmd -S $server -d $database -Q `"$totalRowsQuery`" -h -1 -W"
  $result = Invoke-Expression -Command $totalRowsCmd
  $totalRows = $result[0]
  if ($totalRows -eq 0) {
    Write-Error "No data in table $table"
  }
  $rowsPerFile = 1000000
  $startRow = 1
}
process {
  while ($startRow -le $totalRows) {
    $endRow = $startRow + $rowsPerFile - 1
    if ($endRow -gt $totalRows) {
      $endRow = $totalRows
    }
    $outputFile = "./data-$startRow-$endRow.csv"
    Write-Information "Exporting rows from $startRow to $endRow to file '$outputFile'..."
    $bcpQuery = @"
SELECT
  [USIReserved]
FROM (
  SELECT
    ROW_NUMBER() OVER (ORDER BY [USIReservedID]) AS RowNum,
    [USIReserved]
  FROM $table
) AS temp
WHERE RowNum BETWEEN $startRow AND $endRow
"@
    $bcpCommand = "bcp `"$bcpQuery`" queryout `"$outputFile`" -c -S $server -d $database -T"
    Invoke-Expression -Command $bcpCommand
    $startRow += $rowsPerFile
  }
  Write-Information "Completed."
}
end {
}