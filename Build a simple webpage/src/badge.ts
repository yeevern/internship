import typescriptLogo from "./typescript.svg";
import "./badge.css";

export function insertBadge() {
  const badge = document.querySelector<HTMLDivElement>("#badge");
  if (badge) {
    badge.innerHTML = `
      <div>
        Powered by&nbsp;
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        &nbsp;+&nbsp;
        <a href="https://www.typescriptlang.org/" target="_blank">
          <img src="${typescriptLogo}" class="logo" alt="TypeScript logo" />
        </a>
      </div>
    `;
  }
}
