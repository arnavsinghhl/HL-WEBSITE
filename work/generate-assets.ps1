Add-Type -AssemblyName System.Drawing

$outDir = Join-Path (Get-Location) "outputs\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Canvas($path, $w, $h, [scriptblock]$draw) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    & $draw $g $w $h
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Brush($hex) {
    return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function PenC($hex, $width) {
    return New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($hex)), $width
}

function Fill-RoundedRect($g, $brush, $x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $path.Dispose()
}

$fontLarge = New-Object System.Drawing.Font "Segoe UI", 30, ([System.Drawing.FontStyle]::Bold)
$fontMid = New-Object System.Drawing.Font "Segoe UI", 18, ([System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font "Segoe UI", 12, ([System.Drawing.FontStyle]::Regular)

New-Canvas (Join-Path $outDir "hero-wellness.png") 1200 820 {
    param($g, $w, $h)
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.Rectangle]::new(0,0,$w,$h)), ([System.Drawing.ColorTranslator]::FromHtml("#f4fbf6")), ([System.Drawing.ColorTranslator]::FromHtml("#dff1e9")), 35
    $g.FillRectangle($bg, 0, 0, $w, $h)
    $bg.Dispose()

    $g.FillEllipse((Brush "#b8dccb"), 740, 60, 360, 360)
    $g.FillEllipse((Brush "#f6d889"), 900, 460, 190, 190)
    $g.FillEllipse((Brush "#8bc9b0"), 90, 500, 300, 300)

    Fill-RoundedRect $g (Brush "#ffffff") 110 110 980 590 38
    Fill-RoundedRect $g (Brush "#0f3f33") 145 145 340 510 32
    $g.FillEllipse((Brush "#ffd7b3"), 255, 210, 105, 105)
    $g.FillRectangle((Brush "#ffffff"), 290, 315, 36, 215)
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#ffffff")), 28
    $g.DrawLine($pen, 307, 360, 215, 475)
    $g.DrawLine($pen, 307, 360, 400, 475)
    $g.DrawLine($pen, 307, 520, 242, 628)
    $g.DrawLine($pen, 307, 520, 378, 628)
    $pen.Dispose()

    Fill-RoundedRect $g (Brush "#eff8f2") 540 175 430 112 18
    Fill-RoundedRect $g (Brush "#eff8f2") 540 325 430 112 18
    Fill-RoundedRect $g (Brush "#eff8f2") 540 475 430 112 18
    $g.FillEllipse((Brush "#1f9d70"), 570, 202, 58, 58)
    $g.FillEllipse((Brush "#f0bd49"), 570, 352, 58, 58)
    $g.FillEllipse((Brush "#e97753"), 570, 502, 58, 58)
    $g.DrawString("Nutrition", $fontMid, (Brush "#164036"), 652, 195)
    $g.DrawString("Energy", $fontMid, (Brush "#164036"), 652, 345)
    $g.DrawString("Progress", $fontMid, (Brush "#164036"), 652, 495)
    $g.DrawString("personalized daily support", $fontSmall, (Brush "#58746c"), 652, 232)
    $g.DrawString("simple habits that last", $fontSmall, (Brush "#58746c"), 652, 382)
    $g.DrawString("steady, visible momentum", $fontSmall, (Brush "#58746c"), 652, 532)
}

New-Canvas (Join-Path $outDir "nutrition-bowl.png") 900 620 {
    param($g, $w, $h)
    $g.FillRectangle((Brush "#fff7ed"), 0, 0, $w, $h)
    $g.FillEllipse((Brush "#e7eee6"), 115, 150, 670, 340)
    $g.FillEllipse((Brush "#ffffff"), 155, 112, 590, 350)
    $g.FillEllipse((Brush "#f5dd91"), 218, 175, 170, 140)
    $g.FillEllipse((Brush "#70b77e"), 375, 178, 155, 128)
    $g.FillEllipse((Brush "#e66850"), 518, 182, 150, 128)
    $g.FillEllipse((Brush "#f7c25c"), 312, 300, 145, 115)
    $g.FillEllipse((Brush "#245b45"), 462, 300, 150, 115)
    $g.FillEllipse((Brush "#ffffff"), 420, 236, 70, 70)
    $g.DrawString("Balanced meals", $fontLarge, (Brush "#19483d"), 285, 500)
}

New-Canvas (Join-Path $outDir "community-session.png") 900 620 {
    param($g, $w, $h)
    $g.FillRectangle((Brush "#edf7f2"), 0, 0, $w, $h)
    Fill-RoundedRect $g (Brush "#ffffff") 105 95 690 410 28
    $colors = @("#1f9d70", "#f0bd49", "#e97753", "#17473d", "#75b7a0", "#efb7a0")
    for ($i = 0; $i -lt 6; $i++) {
        $x = 160 + (($i % 3) * 205)
        $y = 145 + ([Math]::Floor($i / 3) * 175)
        Fill-RoundedRect $g (Brush "#f5fbf8") $x $y 145 120 18
        $g.FillEllipse((Brush $colors[$i]), ($x + 44), ($y + 25), 58, 58)
        $g.FillRectangle((Brush $colors[$i]), ($x + 58), ($y + 82), 30, 27)
    }
    $g.DrawString("Virtual wellness club", $fontLarge, (Brush "#19483d"), 270, 532)
}

New-Canvas (Join-Path $outDir "success-gallery.png") 900 620 {
    param($g, $w, $h)
    $g.FillRectangle((Brush "#f4f1e8"), 0, 0, $w, $h)
    Fill-RoundedRect $g (Brush "#ffffff") 115 80 670 455 26
    Fill-RoundedRect $g (Brush "#e8f5ee") 160 135 230 310 18
    Fill-RoundedRect $g (Brush "#143f35") 445 135 230 310 18
    $g.FillEllipse((Brush "#f1c4a3"), 240, 185, 70, 70)
    $g.FillRectangle((Brush "#1f9d70"), 260, 255, 32, 115)
    $g.FillEllipse((Brush "#f1c4a3"), 525, 178, 70, 70)
    $g.FillRectangle((Brush "#ffffff"), 545, 248, 32, 142)
    $g.DrawString("Before", $fontMid, (Brush "#19483d"), 220, 395)
    $g.DrawString("After", $fontMid, (Brush "#ffffff"), 515, 395)
    $g.DrawString("Real progress", $fontLarge, (Brush "#19483d"), 330, 552)
}

$fontLarge.Dispose()
$fontMid.Dispose()
$fontSmall.Dispose()
