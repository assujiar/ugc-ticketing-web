# ============================================
# MIGRATE TOAST TO SONNER (Compatible Version)
# ============================================

# Cari semua file
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    
    # Replace imports
    $content = $content -replace 'import\s*\{\s*useToast\s*\}\s*from\s*"@/components/ui/use-toast"', 'import { toast } from "sonner"'
    $content = $content -replace "import\s*\{\s*useToast\s*\}\s*from\s*'@/components/ui/use-toast'", 'import { toast } from "sonner"'
    $content = $content -replace 'import\s*\{\s*useToast\s*\}\s*from\s*"@/hooks/use-toast"', 'import { toast } from "sonner"'
    $content = $content -replace "import\s*\{\s*useToast\s*\}\s*from\s*'@/hooks/use-toast'", 'import { toast } from "sonner"'
    
    # Remove useToast hook call
    $content = $content -replace 'const\s*\{\s*toast\s*\}\s*=\s*useToast\(\);?\r?\n?', ''
    
    # Replace destructive toast
    $content = $content -replace 'toast\(\{\s*title:\s*"([^"]+)",\s*description:\s*([^,]+),\s*variant:\s*"destructive"\s*\}\)', 'toast.error("$1", { description: $2 })'
    
    # Replace success toast  
    $content = $content -replace 'toast\(\{\s*title:\s*"([^"]+)",\s*description:\s*([^}]+)\}\)', 'toast.success("$1", { description: $2 })'
    
    # Replace simple toast
    $content = $content -replace 'toast\(\{\s*title:\s*"([^"]+)"\s*\}\)', 'toast.success("$1")'
    
    # Save if changed
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nDone! Now add Toaster to your layout.tsx" -ForegroundColor Yellow