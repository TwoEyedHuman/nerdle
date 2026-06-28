import html2canvas from 'html2canvas'

export async function captureAndDownload(element) {
  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    backgroundColor: null,
  })

  const date = new Date().toISOString().slice(0, 10)
  const link = document.createElement('a')
  link.download = `nerdle-${date}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
