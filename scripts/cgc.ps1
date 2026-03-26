param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$cgcHome = Join-Path $repoRoot ".cgc_home"
$cgcScripts = "C:\Users\arabu\AppData\Roaming\Python\Python311\Scripts"

if (-not (Test-Path $cgcHome)) {
  New-Item -ItemType Directory -Path $cgcHome -Force | Out-Null
}

$env:USERPROFILE = $cgcHome
$env:HOMEDRIVE = (Split-Path -Path $cgcHome -Qualifier).TrimEnd('\')
$env:HOMEPATH = $cgcHome.Substring($env:HOMEDRIVE.Length)

if (Test-Path $cgcScripts) {
  $pathParts = $env:Path -split ";"
  if ($pathParts -notcontains $cgcScripts) {
    $env:Path = "$env:Path;$cgcScripts"
  }
}

& cgc @Args
exit $LASTEXITCODE
