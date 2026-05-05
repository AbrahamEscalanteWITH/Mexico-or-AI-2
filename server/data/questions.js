const questions = [
  {
    id: 1,
    description: "A person in a giant peanut mascot costume takes a dramatic plunge, falling from a balcony during a live national television broadcast.",
    isAI: false,
    video: '/media/Cacahuatazo.mp4'
  },
  {
    id: 2,
    description: "An epic, massive brawl erupts at the iconic Insurgentes roundabout as an army of Emos clashes with Punks.",
    isAI: false,
    video: '/media/EmosVSPunks.mp4'
  },
  {
    id: 3,
    description: "Two little people go head-to-head, fiercely throwing punches in a boxing ring on live national television.",
    isAI: false,
    video: '/media/Abelito.mp4'
  },
  {
    id: 4,
    description: "A prominent politician accidentally sits on his own nut while giving a live television interview.",
    isAI: false,
    video: '/media/Huevo.mp4'
  },
  {
    id: 5,
    description: "Pennywise the clown spotted at a local cantina, singing his heart out in a drunken, heartbroken stupor.",
    isAI: false,
    video: '/media/Payaso Eso.mp4'
  },
  {
    id: 6,
    description: "A street performer dressed as a Minion furiously banging out a complex rhythm on a snare drum.",
    isAI: false,
    video: '/media/Minion.mp4'
  },
  {
    id: 7,
    description: "Pop star Justin Bieber surprisingly sitting on the street and playing a snare drum with intense passion.",
    isAI: false,
    video: '/media/Justin.MP4'
  },
  {
    id: 8,
    description: "A pack of street dogs enthusiastically pushing a person riding in a shopping cart as if it were a snow sled.",
    isAI: false,
    video: '/media/Perritos.MP4'
  },
  {
    id: 9,
    description: "Sonic the Hedgehog busts out some slick dance moves in the middle of a traffic jam, performing a synchronized duet with a bystander.",
    isAI: false,
    video: '/media/Sonic.MP4'
  },
  {
    id: 10,
    description: "A street vendor aggressively chasing down a runaway cart full of tamales that was accidentally hooked to a passing police cruiser.",
    isAI: true
  },
  {
    id: 11,
    description: "A group of luchadores in full masks seen peacefully directing traffic after a major intersection's stoplights went out.",
    isAI: true
  },
  {
    id: 12,
    description: "A man fully dressed as Batman spotted eating tacos at a late-night street stand, completely ignoring a nearby fistfight.",
    isAI: true
  },
  {
    id: 13,
    description: "A local news reporter gets photobombed by a horse casually walking out of a convenience store.",
    isAI: true
  },
  {
    id: 14,
    description: "An elaborate quinceañera photoshoot interrupted when the birthday girl's dress gets caught on a passing garbage truck.",
    isAI: true
  },
  {
    id: 15,
    description: "A mariachi band playing fiercely on the back of a moving pickup truck as they try to outrun a severe thunderstorm.",
    isAI: true
  },
  {
    id: 16,
    description: "A stray dog casually walking away with an entire rotisserie chicken while the distracted cook argues with a customer.",
    isAI: true
  },
  {
    id: 17,
    description: "Spiderman spotted performing intense parkour on the rooftops of an old Mexican neighborhood.",
    isAI: true
  },
  {
    id: 18,
    description: "Harry Potter trying to order a magic potion but accidentally buying an exotic spicy salsa from a street vendor.",
    isAI: true
  },
  {
    id: 19,
    description: "Kanye West spotted eating a street taco from a very small local stand in Mexico City while sitting right next to Mario Bros.",
    isAI: true
  },
  {
    id: 20,
    description: "Dua Lipa casually singing a mariachi song alongside a local band in a tiny cantina without anyone noticing who she really is.",
    isAI: true
  }
];

const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

module.exports = shuffledQuestions;
