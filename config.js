export const config = {
  site: {
    title: "6721651556 Phongnarin Rattanachatvichien",
    description: "PHONGNARIN portfolio",
  },

  loading: {
    greeting: "สวัสดี",
    enter: "Enter",
    enterWithoutSound: "Enter without Sound :(",
  },

  signName: "PHONGNARIN",

  deskPhoto: {
    image: "assets/images/profile/me.jpg",
  },

  windowPhoto: {
    image: "assets/images/work/work-5.png",
  },

  room: {
    enabled: true,
    sourceHue: 305,
    sourceRange: 80,
    targetHue: 203,
    spread: 0.45,
    saturation: 1.05,
    brightness: 1.03,
  },

  sceneBackground: "#D3E6F3",

  ui: {
    light: {
      dark: "#245f8f",
      main: "#4a8fc4",
      soft: "#b3d7f0",
      bg: "#e2f1fb",
      text: "#0c2a40",
    },
    dark: {
      dark: "#d3e9f8",
      main: "#7fbbe6",
      soft: "#1f4d73",
      bg: "#0f2f4a",
      text: "#e2f1fb",
    },
  },

  work: {
    idleVideo: null,
    idleImage: "assets/images/work/work-4.png",
    cameraPullBack: 0.8,
    projects: [
      {
        title: "Project 1",
        image: "assets/images/work/work-1.png",
        description:
          "Custom Discord Bots",
        link: "",
      },
      {
        title: "Project 2",
        image: "assets/images/work/work-2.png",
        description:
          "Web App Protypes",
        link: "",
      },
      {
        title: "Project 3",
        image: "assets/images/work/work-3.png",
        description: "Game Development",
        link: "",
      },
    ],
  },

  about: {
    intro: "คลิกเพื่อดูรายละเอียด",
    frames: [
      {
        title: "SKILLS",
        lines: ["JavaScript & Node.js", "Lua", "Three.js / WebGL", "Discord.js"],
      },
      {
        title: "PROJECTS",
        lines: ["Web App Prototypes", "Custom Discord Bots"],
      },
      {
        title: "FOCUS",
        lines: ["Interactive 3D Web", "Game System Design", "Thai-Language UI/UX"],
      },
    ],
  },

  contact: {
    title: "Contact",
    text: "",
    sign: {
      name: "Phongnarin Ratanachatvichien",
      studentId: "6721651556",
      lines: ["Computer Science", "Faculty of Science and Arts", "Kasetsart University"],
      offset: { x: 0, y: 0.5, z: 0 },
    },
  },
};

export const ROOM_PRESETS = {
  original: { enabled: false },
  sky: { enabled: true, sourceHue: 305, sourceRange: 80, targetHue: 203, spread: 0.45, saturation: 1.05, brightness: 1.03 },
  mint: { enabled: true, sourceHue: 305, sourceRange: 80, targetHue: 172, spread: 0.55, saturation: 1.15, brightness: 1.0 },
  peach: { enabled: true, sourceHue: 305, sourceRange: 80, targetHue: 22, spread: 0.4, saturation: 1.0, brightness: 1.05 },
  lime: { enabled: true, sourceHue: 305, sourceRange: 80, targetHue: 105, spread: 0.5, saturation: 1.1, brightness: 1.0 },
};
