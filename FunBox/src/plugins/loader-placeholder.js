export default async function(container, src, behavior) {
  container.innerHTML = `<div style="text-align:center;">🔧 Placeholder<br><small>${behavior}</small></div>`;

  return {
    play: (state) => {
      container.innerHTML = `<div style="text-align:center;">🎬 Playing:<br><strong>${state}</strong></div>`;
    },
    destroy: () => {
      console.log("[FunBox] Destroying placeholder plugin.");
      container.innerHTML = "";
    }
  };
}
