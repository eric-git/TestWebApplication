params
(
    [Parameter()]
    [ValidateSet("DEV", "UAT", "PREPROD", "3PT", "PROD")]
    [string]$Environment,

    [Parameter()]
    [ValidateSet("PreDeployment", "PostDeployment", "DeploymentVerified")]
    [string]$Stage
)

# prep
$configuration = Get-Content "appsettings.json" | ConvertFrom-Json

switch ($Stage) {
    "PreDeployment" {
        # stop app pools

        # add white list

        # stop windows services

        # disable scheduled tasks

    }
    "PostDeployment" {
        # start app pools

        # start windows services

        # enable scheduled tasks

    }
    "DeploymentVerified" {
        # remove white lists

    }
}

function set-app-pool($serverName, $appPoolName, $start) {
    if ($start) {
        Invoke-Command -ComputerName $serverName -ScriptBlock { Start-WebAppPool -Name $appPoolName }
    }
    else {
        Invoke-Command -ComputerName $serverName -ScriptBlock { Stop-WebAppPool -Name $appPoolName }
    }
}

function set-white-list($serverName, $appicationName, $enable) {

}

function set-windows-service($serverName, $serviceName, $start) {
    if ($start) {
        Get-Service -ComputerName $serverName -Name $servicename | Start-Service -Force
    }
    else {
        Get-Service -ComputerName $serverName -Name $servicename | Stop-Service -Force
    }
}

function set-scheduled-task($serverName, $taskName, $enable) {
    $session = New-CimSession -ComputerName $serverName
    if ($enable) {
        Enable-ScheduledTask -CimSession $session -TaskName $taskName
    }
    else {
        Disable-ScheduledTask -CimSession $session -TaskName $taskName
    }
}