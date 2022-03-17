import Component from "./component.mjs";
import { html } from "./../utils/index.mjs";
import { arachne, minerva } from "./../main.mjs";

const sounds = ["click_small", "click", "failure", "hover", "success"];

class LoadingScreen extends Component {
  constructor() {
    super();

    this.name = "loadingscreen";
  }

  connectedCallback() {
    minerva.audioManager
      .load(sounds, "wav")
      .then((allSoundsLoaded) => {
        if (!allSoundsLoaded) {
          arachne.warn("all sounds were not loaded. a file is missing.");
        } else {
          console.log("all sounds successfully loaded");
        }
      })
      .catch(arachne.error);
  }
}

export default { name: "loading-screen", element: LoadingScreen };
