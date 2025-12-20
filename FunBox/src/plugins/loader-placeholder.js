export default async function(canvas, src, behavior) {
  canvas.innerHTML = `<div style="text-align:center;">🔧 Placeholder<br><small>${behavior}</small></div>`;
  return {
    play: (action) => {
      canvas.innerHTML = `<div style="text-align:center;">🎬 Playing:<br><strong>${action}</strong></div>`;
    }
  };
}
