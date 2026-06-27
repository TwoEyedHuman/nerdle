export async function loadWords() {
  const response = await fetch('/words.txt');
  const text = await response.text();
  return text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
}
