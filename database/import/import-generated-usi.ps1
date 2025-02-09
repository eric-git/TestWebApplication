##
# This script imports the pre-generated USIs in chunks from the CSV files exported form VET.
# Author: Eric Wu (EW2848)
# Remarks:
#   1. This script should be run on School DB for testing purposes.
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
  $table = "[$database].[dbo].[CandidateUSIReserved]"
  $childTable = "[$database].[dbo].[CandidateUSIUsedFlag]"
  $dataExists = "data-exists"
  $query = @"
SELECT
CASE
  WHEN EXISTS (SELECT 1 FROM $table) THEN '$dataExists'
  ELSE NULL
END
"@
  $dataExistsQuery = "sqlcmd -S $server -d $database -Q `"$query`" -h -1 -W"
  $result = Invoke-Expression -Command $dataExistsQuery
  if ($result[0] -eq $dataExists) {
    Write-Error "Data exists in $table, please manually handle data import."
  }
  $nameFormat = "data-(\d+)-(\d+)\.csv"
  $sortedCsvFiles = Get-ChildItem `
    -Path ./ `
    -Filter data-*.csv | Where-Object {
    $_.Name -match $nameFormat
  } | Sort-Object {
    $startRow = [regex]::Match($_.Name, $nameFormat).Groups[1].Value
    [int]$startRow
  }
  $query = @"
INSERT INTO $childTable
(
  [CandidateUSIReservedID],
  [CandidateUSIUsedFlag]
)
SELECT
  [p].[CandidateUSIReservedID],
  CASE
    WHEN EXISTS (
      SELECT
        *
      FROM [$database].[dbo].[USIRecord]
      WHERE [USI] = [p].[CandidateUSIReserved] AND [IsSchoolRecord] = 1
    ) THEN 1
    ELSE 0
  END
FROM $table [p]
WHERE NOT EXISTS (
  SELECT
    *
  FROM $childTable [c]
  WHERE [c].[CandidateUSIReservedID] = [p].[CandidateUSIReservedID]
)
"@
}
process {
  foreach ($csvFile in $sortedCsvFiles) {
    Write-Information "Importing $csvFile..."
    $bcpCommand = "bcp $table in ./$($csvFile.Name) -f ./import-generated-usi.fmt -S $server -T -b 10000"
    Invoke-Expression -Command $bcpCommand
    Write-Information "Creating data in $childTable..."
    $dataQuery = "sqlcmd -S $server -d $database -Q `"$query`""
    Invoke-Expression -Command $dataQuery
  }
  Write-Information "Completed."
}
end {
}