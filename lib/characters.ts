export interface Emotion {
  name: string;
  url: string;
}

export interface Character {
  id: string;
  name: string;
  portraitUrl: string; // Default portrait
  emotions?: Emotion[];
  voiceUrls?: string[];
  defaultFont?: string;
}

export interface FontOption {
  id: string;
  name: string;
  variable: string;
}

export const FONTS: FontOption[] = [
  {
    id: "determination",
    name: "dtmMono",
    variable: "var(--font-mono-pixel)",
  },
  { id: "sans", name: "comicSans", variable: "var(--font-comic)" },
  { id: "papyrus", name: "papyrus", variable: "var(--font-papyrus)" },
];

export const CHARACTERS: Character[] = [
  {
    id: "sans",
    name: "Sans",
    portraitUrl: "/images/spr_face_sans.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_face_sans.png",
      },
      {
        name: "Wink",
        url: "/images/spr_face_sanswink.png",
      },
      {
        name: "No Eyes",
        url: "/images/spr_face_sansnoeyes.png",
      },
      {
        name: "Chuckle",
        url: "/images/spr_face_sanschuckle.png",
      },
      {
        name: "Closed Eyes",
        url: "/images/spr_face_sansblink.png",
      },
    ],
    voiceUrls: [
      "/sounds/sound_audio_snd_txtsans.wav",
      "/sounds/sound_audio_snd_txtsans2.wav",
    ],
    defaultFont: "sans",
  },
  {
    id: "papyrus",
    name: "Papyrus",
    portraitUrl: "/images/spr_face_papyrus_0.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_face_papyrus_0.png",
      },
      {
        name: "Mad",
        url: "/images/spr_face_papyrusmad_0.png",
      },
      {
        name: "Shock",
        url: "/images/spr_face_papyruswacky_0.png",
      },
      {
        name: "Side",
        url: "/images/spr_face_papyrusside_0.png",
      },
      {
        name: "Evil",
        url: "/images/spr_face_papyrusevil_0.png",
      },
    ],
    voiceUrls: ["/sounds/sound_audio_snd_txtpap.wav"],
    defaultFont: "papyrus",
  },
  {
    id: "toriel",
    name: "Toriel",
    portraitUrl: "/images/spr_face_torielhappy_2.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_face_torielhappytalk_1.png",
      },
      {
        name: "Smile",
        url: "/images/spr_face_toriellaugh_0.png",
      },
      {
        name: "Sad",
        url: "/images/spr_face_torielpain.png",
      },
      {
        name: "No Asgore",
        url: "/images/spr_face_toriel_noasgore.png",
      },
      {
        name: "Cold",
        url: "/images/spr_face_torielcold_0.png",
      },
      {
        name: "Die",
        url: "/images/spr_face_torieldie.png",
      },
      {
        name: "Mad",
        url: "/images/spr_face_torielmad_0.png",
      },
      {
        name: "Revenge",
        url: "/images/spr_face_torielrevenge.png",
      },
      {
        name: "Blush",
        url: "/images/spr_face_torielembarrassed.png",
      },
      {
        name: "Sigh",
        url: "/images/spr_face_torielsigh.png",
      },
      {
        name: "What",
        url: "/images/spr_face_torielwhat.png",
      },
      {
        name: "What Side",
        url: "/images/spr_face_torielwhatside.png",
      },
      {
        name: "Surprised",
        url: "/images/spr_face_torielsurprised.png",
      },
    ],
    voiceUrls: [
      "/sounds/sound_audio_snd_txttor.wav",
      "/sounds/sound_audio_snd_txttor2.wav",
      "/sounds/sound_audio_snd_txttor3.wav",
    ],
    defaultFont: "determination",
  },
  {
    id: "flowey",
    name: "Flowey",
    portraitUrl: "/images/spr_flowey_riseanim_0.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_flowey_riseanim_1.png",
      },
      {
        name: "Evil",
        url: "/images/spr_floweyevil_0.png",
      },
      {
        name: "Mouth Open",
        url: "/images/spr_floweyplain_0.png",
      },
      {
        name: "Sassy",
        url: "/images/spr_floweysassy_0.png",
      },
      {
        name: "Skull",
        url: "/images/spr_flowey_toskull_0.png",
      },
      {
        name: "Grin",
        url: "/images/spr_floweygrin_0.png",
      },
      {
        name: "Side",
        url: "/images/spr_floweyside_0.png",
      },
      {
        name: "Toriel 1",
        url: "/images/spr_floweytoriel_0.png",
      },
      {
        name: "Toriel 2",
        url: "/images/spr_floweytoriel2_0.png",
      },
      {
        name: "Wink",
        url: "/images/spr_floweywink_0.png",
      },
      {
        name: "Frown",
        url: "/images/spr_flowey_riseanim2_0.png",
      },
    ],
    voiceUrls: [
      "/sounds/sound_audio_snd_floweytalk1.wav",
      "/sounds/sound_audio_snd_floweytalk2.wav",
    ],
    defaultFont: "determination",
  },
  {
    id: "undyne",
    name: "Undyne",
    portraitUrl: "/images/spr_face_undyne1.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_face_undyne1.png",
      },
      {
        name: "Mad",
        url: "/images/spr_face_undyne4.png",
      },
      {
        name: "Sad",
        url: "/images/spr_face_undyne7.png",
      },
      {
        name: "OwO",
        url: "/images/spr_face_undyne8.png",
      },
    ],
    voiceUrls: [
      "/sounds/sound_audio_snd_txtund.wav",
      "/sounds/sound_audio_snd_txtund2.wav",
      "/sounds/sound_audio_snd_txtund3.wav",
      "/sounds/sound_audio_snd_txtund4.wav",
      "/sounds/sound_audio_snd_txtund_hyper.wav",
    ],
    defaultFont: "determination",
  },
  {
    id: "alphys",
    name: "Alphys",
    portraitUrl: "/images/spr_alphysface_0_0.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_alphysface_0_0.png",
      },
      {
        name: "Closed Mouth",
        url: "/images/spr_alphysface_1_0.png",
      },
      {
        name: "Eyes Left",
        url: "/images/spr_alphysface_2_0.png",
      },
      {
        name: "Scared",
        url: "/images/spr_alphysface_3_0.png",
      },
      {
        name: "Sweat",
        url: "/images/spr_alphysface_4_0.png",
      },
      {
        name: "Embarrassed",
        url: "/images/spr_alphysface_5_0.png",
      },
      {
        name: "Angry",
        url: "/images/spr_alphysface_6_0.png",
      },
      {
        name: "Fake Laugh",
        url: "/images/spr_alphysface_7_0.png",
      },
    ],
    voiceUrls: ["/sounds/sound_audio_snd_txtal.wav"],
    defaultFont: "determination",
  },
  {
    id: "asgore",
    name: "Asgore",
    portraitUrl: "/images/spr_asgore_face0_1.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_asgore_face0_0.png",
      },
      {
        name: "Normal 2",
        url: "/images/spr_asgore_face0_1.png",
      },
      {
        name: "Tired",
        url: "/images/spr_asgore_face0_blink_0.png",
      },
      {
        name: "Shut Eyes",
        url: "/images/spr_asgore_face0_blink_1.png",
      },
      {
        name: "Twinkle Eyed",
        url: "/images/spr_asgore_face1_0.png",
      },
      {
        name: "Twinkle Eyed 2",
        url: "/images/spr_asgore_face1.png",
      },
      {
        name: "Looking Left",
        url: "/images/spr_asgore_face2_0.png",
      },
      {
        name: "Looking Right",
        url: "/images/spr_asgore_face3_0.png",
      },
      {
        name: "Dejected",
        url: "/images/spr_asgore_face5_1.png",
      },
      {
        name: "Sad",
        url: "/images/spr_asgore_lastface_0.png",
      },
      {
        name: "Crying",
        url: "/images/spr_asgore_lastface_3.png",
      },
      {
        name: "Crying 2",
        url: "/images/spr_sadgore_face_1.png",
      },
      {
        name: "Eyes Bulging",
        url: "/images/spr_sadgore_face_3.png",
      },
      {
        name: "Censored Eyes",
        url: "/images/spr_sadgore_face_4.png",
      },
      {
        name: "Shocked",
        url: "/images/spr_asgore_shockface_0.png",
      },
      {
        name: "Sweat",
        url: "/images/spr_asgore_wrapface_0.png",
      },
    ],
    voiceUrls: ["/sounds/sound_audio_snd_txtasg.wav"],
    defaultFont: "determination",
  },
  {
    id: "asriel",
    name: "Asriel",
    portraitUrl: "/images/spr_face_asriel0_1.png",
    emotions: [
      {
        name: "Normal",
        url: "/images/spr_face_asriel0_1.png",
      },
      {
        name: "Sad",
        url: "/images/spr_face_asriel1_1.png",
      },
      {
        name: "Pout",
        url: "/images/spr_face_asriel2_1.png",
      },
      {
        name: "Cry",
        url: "/images/spr_face_asriel3_1.png",
      },
      {
        name: "Menacing",
        url: "/images/spr_face_asriel4_0.png",
      },
      {
        name: "Menacing 2",
        url: "/images/spr_face_asriel4_1.png",
      },
      {
        name: "Normal 2",
        url: "/images/spr_face_asriel5_1.png",
      },
      {
        name: "Side",
        url: "/images/spr_face_asriel9_0.png",
      },
      {
        name: "God Angry",
        url: "/images/spr_asrielhead_0.png",
      },
      {
        name: "God Sassy",
        url: "/images/spr_asrielhead_1.png",
      },
      {
        name: "God Yell",
        url: "/images/spr_asrielhead_2.png",
      },
      {
        name: "God Smug",
        url: "/images/spr_asrielhead_3.png",
      },
      {
        name: "God Normal",
        url: "/images/spr_asrielhead_4.png",
      },
    ],
    voiceUrls: [
      "/sounds/sound_audio_snd_txtasr.wav",
      "/sounds/sound_audio_snd_txtasr2.wav",
    ],
    defaultFont: "determination",
  },
  {
    id: "none",
    name: "None",
    portraitUrl: "",
    voiceUrls: [
      "/sounds/sound_audio_SND_TXT1.wav",
      "/sounds/sound_audio_SND_TXT2.wav",
    ],
    defaultFont: "determination",
  },
];
