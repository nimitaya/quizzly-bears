// ========== TRANSLATIONS ==========
// This file contains all UI text translations for the app

export interface TranslationKeys {
  // Navigation & Common
  play: string;
  profile: string;
  settings: string;
  back: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  
  // Quiz Related
  start: string;
  next: string;
  submit: string;
  answer: string;
  question: string;
  score: string;
  points: string;
  time: string;
  timer: string;
  correct: string;
  incorrect: string;
  gameOver: string;
  congratulations: string;
  tryAgain: string;
  continue: string;
  
  // Profile & Settings
  sound: string;
  music: string;
  language: string;
  selectLanguage: string;
  account: string;
  friends: string;
  invitations: string;
  faq: string;
  showOnboarding: string;
  waitingForAdmin: string;
  
  // Game Modes
  solo: string;
  group: string;
  duel: string;
  multiplayer: string;
  
  // Categories
  science: string;
  history: string;
  sports: string;
  geography: string;
  media: string;
  culture: string;
  dailyLife: string;
  custom: string;
  
  // Difficulty
  easy: string;
  medium: string;
  hard: string;
  
  // Multiplayer
  room: string;
  roomId: string;
  joinRoom: string;
  createRoom: string;
  leaveRoom: string;
  host: string;
  player: string;
  players: string;
  waitingForPlayers: string;
  gameStarted: string;
  selectCategory: string;
  selectedTopic: string;
  
  // Alerts & Messages
  newHost: string;
  isNowHost: string;
  failedToGenerate: string;
  checkConnection: string;
  playMiniGames: string;
  sureToCancel: string;
  sureToLeave: string;
  loadingRoom: string;
  rejoiningRoom: string;
  
  // Countdown
  countdown: string;
  getReady: string;
  
  // Results
  finalScore: string;
  correctAnswers: string;
  totalQuestions: string;
  timeBonus: string;
  perfectGame: string;
  totalPoints: string;
  accuracy: string;
  
  // Buttons
  go: string;
  waiting: string;
  generating: string;
  generatingQuestions: string;
  thatsGreat: string;
  chosenTopic: string;
  assignedCategory: string;
  chosenLevel: string;
  questionsCount: string;
  maxTime: string;
  seconds: string;
  
  // Statistics & Play
  goPlay: string;
  myRank: string;
  from: string;
  topPlayers: string;
  myStatistics: string;
  quizzlyPoints: string;
  categoryPerformance: string;
  pleaseLogin: string;
  userNotRegistered: string;
  
  // Onboarding
  quizzlyBearsGuide: string;
  aiGenerated: string;
  getUniqueQuizzes: string;
  customTopics: string;
  chooseTopicsOrOwn: string;
  playYourWay: string;
  soloOrWithFriends: string;
  competeAndWin: string;
  scorePointsConnectFriends: string;
  getStarted: string;
  
  // FAQ & Account
  frequentlyAskedQuestions: string;
  accountSettings: string;
  logInSignUp: string;
  createAccountOrLogin: string;
  saveProgressConnectFriends: string;
  skipForNow: string;
  logInWithEmail: string;
  signUp: string;
  
  // Invitations
  noInvitations: string;
  startGameYourself: string;
  gameInvitations: string;
  
  // Friends
  friend: string;
  emptyFriendsList: string;
  inviteSomeone: string;
  refreshFriends: string;
  
  // Quiz Types
  playAlone: string;
  playDuel: string;
  playGroup: string;
  miniGames: string;
  
  // Category Screen
  yourTopic: string;
  search: string;
  orPickPreparedCategory: string;
  
  // Difficulty Levels
  easyCubCurious: string;
  mediumBearlyBrainy: string;
  hardGrizzlyGuru: string;
  
  // Account Functions
  changePassword: string;
  logOut: string;
  deleteAccount: string;
  changing: string;
  signingOut: string;
  deleting: string;
  currentPassword: string;
  newPassword: string;
  repeatNewPassword: string;
  changePasswordTitle: string;
  deleteAccountTitle: string;
  deleteAccountMessage: string;
  deleteConfirm: string;
  reLoginRequired: string;
  reLoginMessage: string;
  reLogin: string;
  passwordChanged: string;
  googleFacebookPassword: string;
  
  // FAQ Questions and Answers
  faqHowDoesGameWork: string;
  faqHowDoesGameWorkAnswer: string;
  faqGameModes: string;
  faqGameModesAnswer: string;
  faqTimingAndAnswering: string;
  faqTimingAndAnsweringAnswer: string;
  faqPoints: string;
  faqPointsAnswer: string;
  faqRewards: string;
  faqRewardsAnswer: string;
  faqStats: string;
  faqStatsAnswer: string;
  faqChallenges: string;
  faqChallengesAnswer: string;
  faqFriends: string;
  faqFriendsAnswer: string;
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    // Navigation & Common
    play: "Play",
    profile: "Profile",
    settings: "Settings",
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Quiz Related
    start: "Start",
    next: "Next",
    submit: "Submit",
    answer: "Answer",
    question: "Question",
    score: "Score",
    points: "Points",
    time: "Time",
    timer: "Timer",
    correct: "Correct!",
    incorrect: "Incorrect",
    gameOver: "Game Over",
    congratulations: "Congratulations!",
    tryAgain: "Try Again",
    continue: "Continue",
    
    // Profile & Settings
    sound: "Sound",
    music: "Music",
    language: "Language",
    selectLanguage: "Select Language",
    account: "Account",
    friends: "Friends",
    invitations: "Invitations",
    faq: "FAQ",
    showOnboarding: "Show Onboarding",
    waitingForAdmin: "Waiting for admin bear...",
    
    // Game Modes
    solo: "Solo",
    group: "Group",
    duel: "Duel",
    multiplayer: "Multiplayer",
    
    // Categories
    science: "Science",
    history: "History",
    sports: "Sports",
    geography: "Geography",
    media: "Media",
    culture: "Culture",
    dailyLife: "Daily Life",
    custom: "Custom",
    
    // Difficulty
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    
    // Multiplayer
    room: "Room",
    roomId: "Room ID",
    joinRoom: "Join Room",
    createRoom: "Create Room",
    leaveRoom: "Leave Room",
    host: "Host",
    player: "Player",
    players: "Players",
    waitingForPlayers: "Waiting for players...",
    gameStarted: "Game Started!",
    selectCategory: "Select Category",
    selectedTopic: "Selected Topic",
    
    // Alerts & Messages
    newHost: "New Host",
    isNowHost: "is now the room host",
    failedToGenerate: "Failed to generate questions. Please try again or check your internet connection — or play the mini games in the meantime.",
    checkConnection: "Check your internet connection",
    playMiniGames: "Play Mini Games",
    sureToCancel: "Are you sure you want to cancel the room?",
    sureToLeave: "Are you sure you want to leave the room?",
    loadingRoom: "Loading room...",
    rejoiningRoom: "Rejoining room...",
    
    // Countdown
    countdown: "Countdown",
    getReady: "Get Ready!",
    
    // Results
    finalScore: "Final Score",
    correctAnswers: "Correct Answers",
    totalQuestions: "Total Questions",
    timeBonus: "Time Bonus",
    perfectGame: "Perfect Game",
    totalPoints: "Total Points",
    accuracy: "Accuracy",
    
    // Buttons
    go: "Go",
    waiting: "Waiting",
    generating: "Generating...",
    generatingQuestions: "Generating Questions...",
    thatsGreat: "That's the great!",
    chosenTopic: "Chosen topic",
    assignedCategory: "Assigned category",
    chosenLevel: "Chosen level",
    questionsCount: "10 questions, max 30 seconds each",
    maxTime: "max 30 seconds each",
    seconds: "seconds",
    
    // Statistics & Play
    goPlay: "Go Play",
    myRank: "My Rank",
    from: "from",
    topPlayers: "Top 10 Players",
    myStatistics: "My statistics",
    quizzlyPoints: "Quizzly Points",
    categoryPerformance: "Category performance",
    pleaseLogin: "Please log in to see your statistics.",
    userNotRegistered: "Such user isn't registered yet. Please try again later.",
    
    // Onboarding
    quizzlyBearsGuide: "Quizzly Bears Guide",
    aiGenerated: "AI-Generated",
    getUniqueQuizzes: "Get unique quizzes created by AI",
    customTopics: "Custom Topics",
    chooseTopicsOrOwn: "Choose from our topics or enter your own (any language)",
    playYourWay: "Play Your Way",
    soloOrWithFriends: "Solo or with friends",
    competeAndWin: "Compete & Win",
    scorePointsConnectFriends: "Score points, connect with friends, and become the weekly best",
    getStarted: "Get Started",
    
    // FAQ & Account
    frequentlyAskedQuestions: "Frequently Asked Questions",
    accountSettings: "Account Settings",
    logInSignUp: "Log in / Sign Up",
    createAccountOrLogin: "Create an account or log in to save your progress and connect with friends to explore together.",
    saveProgressConnectFriends: "You can always skip this step for now and come back later!",
    skipForNow: "Skip",
    logInWithEmail: "Log in with e-mail",
    signUp: "Sign Up",
    
    // Invitations
    noInvitations: "No invitations right now.",
    startGameYourself: "You can start a game yourself!",
    gameInvitations: "Game Invitations",
    
    // Friends
    friend: "Friend",
    emptyFriendsList: "Unfortunately, it's empty so far...",
    inviteSomeone: "Invite someone over.",
    refreshFriends: "Refresh Friends",
    
    // Quiz Types
    playAlone: "Play alone",
    playDuel: "Play a duel",
    playGroup: "Play in group",
    miniGames: "Mini games",
    
    // Category Screen
    yourTopic: "your topic ...",
    search: "Search",
    orPickPreparedCategory: "Or pick a prepared category",
    
    // Difficulty Levels
    easyCubCurious: "Easy: Cub Curious",
    mediumBearlyBrainy: "Medium: Bearly Brainy",
    hardGrizzlyGuru: "Hard: Grizzly Guru",
    
    // Account Functions
    changePassword: "Change Password",
    logOut: "Log out",
    deleteAccount: "Delete Account",
    changing: "Changing...",
    signingOut: "Signing out...",
    deleting: "Deleting...",
    currentPassword: "current password",
    newPassword: "new password",
    repeatNewPassword: "repeat new password",
    changePasswordTitle: "Change Password",
    deleteAccountTitle: "Delete Account",
    deleteAccountMessage: "Are you sure you want to delete your account? This action cannot be undone.",
    deleteConfirm: "Delete",
    reLoginRequired: "Re-login Required",
    reLoginMessage: "For security, please log in again to delete your account.",
    reLogin: "Re-login",
    passwordChanged: "Your password has been changed.",
    googleFacebookPassword: "You signed up with Google or Facebook. You can't change your password.",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "How does the game work?",
    faqHowDoesGameWorkAnswer: "Each game round consists of 10 questions, with 30 seconds to answer each. The total round lasts about 5 minutes, plus a short time to read each question before the timer starts.",
    faqGameModes: "What game modes are available?",
    faqGameModesAnswer: "We offer three types of games:\n• Solo Mode - Play on your own, continue as soon as you answer.\n• Duel (1 vs 1) - Play against another user in 4 rounds of 10 questions each.\n• Group Mode - Each player plays one 10-question round. Up to 7-8 participants.",
    faqTimingAndAnswering: "How does timing and answering work?",
    faqTimingAndAnsweringAnswer: "First, the question is shown with a few seconds to read. Then, the answer options appear. Only after that does the 30-second timer start. In solo mode, you continue immediately after answering. In multiplayer modes, everyone answers at the same time (synchronous play). During waiting times, you'll see a cute bear loading animation.",
    faqPoints: "How are points awarded?",
    faqPointsAnswer: "You earn points based on the difficulty of the question and how fast you answer:\n\nCorrect Answers:\n• Easy: 5 QP\n• Medium: 10 QP\n• Hard: 15 QP\n\nTime Bonus:\n• Answer under 5 sec: +5 QP\n• Answer under 10 sec: +3 QP\n• Answer under 20 sec: +1 QP\n\nPerfect Round Bonus:\n• All 10 questions correct: +50 QP",
    faqRewards: "Are there any rewards?",
    faqRewardsAnswer: "Yes! We reward performance:\n\nTop 3 of the week: Receive medals (bronze, silver, gold) shown on your profile. Each comes with a Quizzly Bear trophy!\n\nTop accuracy (e.g. top 10% or 20%): Get a paw icon Medalen next to your username. Displayed in all games and rankings. Paw disappears if you fall below the threshold in the next week.",
    faqStats: "Can I track my stats?",
    faqStatsAnswer: "Yes! Your profile shows:\n• Total points\n• Accuracy\n• Weekly rankings\n• Medals and rewards\n\nAlways up to date!",
    faqChallenges: "Are there any special challenges?",
    faqChallengesAnswer: "The Top 10 players of the week might unlock an extra-hard quiz as a personal challenge! This is an optional feature we're currently testing.",
    faqFriends: "How can I add friends?",
    faqFriendsAnswer: "• Search for friends by username or email address.\n• Send a friend request - the other user must accept.\n• If your friend doesn't have the app yet, you can send an invitation via email.",
  },
  
  de: {
    // Navigation & Common
    play: "Spielen",
    profile: "Profil",
    settings: "Einstellungen",
    back: "Zurück",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schließen",
    loading: "Lädt...",
    error: "Fehler",
    success: "Erfolg",
    
    // Quiz Related
    start: "Start",
    next: "Weiter",
    submit: "Absenden",
    answer: "Antwort",
    question: "Frage",
    score: "Punkte",
    points: "Punkte",
    time: "Zeit",
    timer: "Timer",
    correct: "Richtig!",
    incorrect: "Falsch",
    gameOver: "Spiel beendet",
    congratulations: "Glückwunsch!",
    tryAgain: "Nochmal versuchen",
    continue: "Weiter",
    
    // Profile & Settings
    sound: "Ton",
    music: "Musik",
    language: "Sprache",
    selectLanguage: "Sprache auswählen",
    account: "Konto",
    friends: "Freunde",
    invitations: "Einladungen",
    faq: "FAQ",
    showOnboarding: "Onboarding anzeigen",
    waitingForAdmin: "Warte auf Admin-Bär...",
    
    // Game Modes
    solo: "Einzelspieler",
    group: "Gruppe",
    duel: "Duell",
    multiplayer: "Mehrspieler",
    
    // Categories
    science: "Wissenschaft",
    history: "Geschichte",
    sports: "Sport",
    geography: "Geographie",
    media: "Medien",
    culture: "Kultur",
    dailyLife: "Alltag",
    custom: "Benutzerdefiniert",
    
    // Difficulty
    easy: "Einfach",
    medium: "Mittel",
    hard: "Schwer",
    
    // Multiplayer
    room: "Raum",
    roomId: "Raum-ID",
    joinRoom: "Raum beitreten",
    createRoom: "Raum erstellen",
    leaveRoom: "Raum verlassen",
    host: "Host",
    player: "Spieler",
    players: "Spieler",
    waitingForPlayers: "Warte auf Spieler...",
    gameStarted: "Spiel gestartet!",
    selectCategory: "Kategorie auswählen",
    selectedTopic: "Ausgewähltes Thema",
    
    // Alerts & Messages
    newHost: "Neuer Host",
    isNowHost: "ist jetzt der Raum-Host",
    failedToGenerate: "Fragen konnten nicht generiert werden. Bitte versuche es erneut oder überprüfe deine Internetverbindung — oder spiele in der Zwischenzeit die Mini-Spiele.",
    checkConnection: "Überprüfe deine Internetverbindung",
    playMiniGames: "Mini-Spiele spielen",
    sureToCancel: "Bist du sicher, dass du den Raum abbrechen möchtest?",
    sureToLeave: "Bist du sicher, dass du den Raum verlassen möchtest?",
    loadingRoom: "Raum lädt...",
    rejoiningRoom: "Raum wieder beitreten...",
    
    // Countdown
    countdown: "Countdown",
    getReady: "Mach dich bereit!",
    
    // Results
    finalScore: "Endpunktzahl",
    correctAnswers: "Richtige Antworten",
    totalQuestions: "Gesamtfragen",
    timeBonus: "Zeitbonus",
    perfectGame: "Perfektes Spiel",
    totalPoints: "Gesamtpunkte",
    accuracy: "Genauigkeit",
    
    // Buttons
    go: "Los",
    waiting: "Warten",
    generating: "Generiere...",
    generatingQuestions: "Generiere Fragen...",
    thatsGreat: "Das ist großartig!",
    chosenTopic: "Gewähltes Thema",
    assignedCategory: "Zugewiesene Kategorie",
    chosenLevel: "Gewähltes Level",
    questionsCount: "10 Fragen, max. 30 Sekunden pro Frage",
    maxTime: "max. 30 Sekunden pro Frage",
    seconds: "Sekunden",
    
    // Statistics & Play
    goPlay: "Los spielen",
    myRank: "Mein Rang",
    from: "von",
    topPlayers: "Top 10 Spieler",
    myStatistics: "Meine Statistiken",
    quizzlyPoints: "Quizzly Punkte",
    categoryPerformance: "Kategorienleistung",
    pleaseLogin: "Bitte melde dich an, um deine Statistiken zu sehen.",
    userNotRegistered: "Dieser Benutzer ist noch nicht registriert. Bitte versuche es später erneut.",
    
    // Onboarding
    quizzlyBearsGuide: "Quizzly Bears Anleitung",
    aiGenerated: "KI-generiert",
    getUniqueQuizzes: "Erhalte einzigartige Quizze, die von KI erstellt wurden",
    customTopics: "Benutzerdefinierte Themen",
    chooseTopicsOrOwn: "Wähle aus unseren Themen oder gib deine eigenen ein (jede Sprache)",
    playYourWay: "Spiele auf deine Weise",
    soloOrWithFriends: "Allein oder mit Freunden",
    competeAndWin: "Wetteifere & Gewinne",
    scorePointsConnectFriends: "Sammle Punkte, verbinde dich mit Freunden und werde der wöchentliche Beste",
    getStarted: "Los geht's",
    
    // FAQ & Account
    frequentlyAskedQuestions: "Häufig gestellte Fragen",
    accountSettings: "Kontoeinstellungen",
    logInSignUp: "Anmelden / Registrieren",
    createAccountOrLogin: "Erstelle ein Konto oder melde dich an, um deinen Fortschritt zu speichern und dich mit Freunden zu verbinden.",
    saveProgressConnectFriends: "Du kannst diesen Schritt jetzt überspringen und später zurückkommen!",
    skipForNow: "Überspringen",
    logInWithEmail: "Mit E-Mail anmelden",
    signUp: "Registrieren",
    
    // Invitations
    noInvitations: "Keine Einladungen zurzeit.",
    startGameYourself: "Du kannst eine Partie selbst starten!",
    gameInvitations: "Spiel-Einladungen",
    
    // Friends
    friend: "Freund",
    emptyFriendsList: "Leider ist es noch leer...",
    inviteSomeone: "Lade jemanden ein.",
    refreshFriends: "Freunde aktualisieren",
    
    // Quiz Types
    playAlone: "Allein spielen",
    playDuel: "Duell spielen",
    playGroup: "In Gruppe spielen",
    miniGames: "Mini-Spiele",
    
    // Category Screen
    yourTopic: "dein Thema ...",
    search: "Suchen",
    orPickPreparedCategory: "Oder wähle eine vorbereitete Kategorie",
    
    // Difficulty Levels
    easyCubCurious: "Einfach: Neugieriger Welpe",
    mediumBearlyBrainy: "Mittel: Bärenschlau",
    hardGrizzlyGuru: "Schwer: Grizzly-Guru",
    
    // Account Functions
    changePassword: "Passwort ändern",
    logOut: "Ausloggen",
    deleteAccount: "Konto löschen",
    changing: "Ändere Passwort...",
    signingOut: "Auslogge...",
    deleting: "Lösche...",
    currentPassword: "aktuelles Passwort",
    newPassword: "neues Passwort",
    repeatNewPassword: "neues Passwort wiederholen",
    changePasswordTitle: "Passwort ändern",
    deleteAccountTitle: "Konto löschen",
    deleteAccountMessage: "Bist du sicher, dass du dein Konto löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteConfirm: "Löschen",
    reLoginRequired: "Erneut anmelden erforderlich",
    reLoginMessage: "Aus Sicherheitsgründen müssen Sie sich erneut anmelden, um Ihr Konto zu löschen.",
    reLogin: "Erneut anmelden",
    passwordChanged: "Ihr Passwort wurde geändert.",
    googleFacebookPassword: "Sie haben sich mit Google oder Facebook angemeldet. Sie können Ihr Passwort nicht ändern.",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "Wie funktioniert das Spiel?",
    faqHowDoesGameWorkAnswer: "Jede Spielrunde besteht aus 10 Fragen, mit jeweils 30 Sekunden Antwortzeit. Die gesamte Runde dauert etwa 5 Minuten, plus eine kurze Zeit zum Lesen jeder Frage, bevor der Timer startet.",
    faqGameModes: "Welche Spielmodi gibt es?",
    faqGameModesAnswer: "Wir bieten drei Spieltypen an:\n• Einzelspieler-Modus - Spiele für dich selbst, fahre fort, sobald du antwortest.\n• Duell (1 gegen 1) - Spiele gegen einen anderen Benutzer in 4 Runden mit je 10 Fragen.\n• Gruppenmodus - Jeder Spieler spielt eine Runde mit 10 Fragen. Bis zu 7-8 Teilnehmer.",
    faqTimingAndAnswering: "Wie funktionieren Timing und Antworten?",
    faqTimingAndAnsweringAnswer: "Zuerst wird die Frage mit einigen Sekunden Lesezeit angezeigt. Dann erscheinen die Antwortmöglichkeiten. Erst danach beginnt der 30-Sekunden-Timer. Im Einzelspielermodus geht es sofort nach der Antwort weiter. In Mehrspielermodi antworten alle gleichzeitig (synchrones Spiel). Während der Wartezeiten siehst du eine niedliche Bären-Ladeanimation.",
    faqPoints: "Wie werden Punkte vergeben?",
    faqPointsAnswer: "Du erhältst Punkte basierend auf dem Schwierigkeitsgrad der Frage und wie schnell du antwortest:\n\nRichtige Antworten:\n• Einfach: 5 QP\n• Mittel: 10 QP\n• Schwer: 15 QP\n\nZeitbonus:\n• Antwort unter 5 Sek: +5 QP\n• Antwort unter 10 Sek: +3 QP\n• Antwort unter 20 Sek: +1 QP\n\nPerfekte Runde Bonus:\n• Alle 10 Fragen richtig: +50 QP",
    faqRewards: "Gibt es Belohnungen?",
    faqRewardsAnswer: "Ja! Wir belohnen Leistung:\n\nTop 3 der Woche: Erhalte Medaillen (Bronze, Silber, Gold) auf deinem Profil. Jede kommt mit einer Quizzly Bear Trophäe!\n\nTop-Genauigkeit (z.B. top 10% oder 20%): Erhalte ein Pfoten-Icon neben deinem Benutzernamen. Wird in allen Spielen und Ranglisten angezeigt. Die Pfote verschwindet, wenn du in der nächsten Woche unter den Schwellenwert fällst.",
    faqStats: "Kann ich meine Statistiken verfolgen?",
    faqStatsAnswer: "Ja! Dein Profil zeigt:\n• Gesamtpunkte\n• Genauigkeit\n• Wöchentliche Ranglisten\n• Medaillen und Belohnungen\n\nImmer aktuell!",
    faqChallenges: "Gibt es besondere Herausforderungen?",
    faqChallengesAnswer: "Die Top 10 Spieler der Woche können ein extra schweres Quiz als persönliche Herausforderung freischalten! Dies ist eine optionale Funktion we're currently testing.",
    faqFriends: "Wie kann ich Freunde hinzufügen?",
    faqFriendsAnswer: "• Suche nach Freunden per Benutzername oder E-Mail-Adresse.\n• Sende eine Freundschaftsanfrage - der andere Benutzer muss diese akzeptieren.\n• Wenn dein Freund die App noch nicht hat, kannst du eine Einladung per E-Mail senden.",
  },
  
  es: {
    // Navigation & Common
    play: "Jugar",
    profile: "Perfil",
    settings: "Configuración",
    back: "Atrás",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    
    // Quiz Related
    start: "Comenzar",
    next: "Siguiente",
    submit: "Enviar",
    answer: "Respuesta",
    question: "Pregunta",
    score: "Puntuación",
    points: "Puntos",
    time: "Tiempo",
    timer: "Temporizador",
    correct: "¡Correcto!",
    incorrect: "Incorrecto",
    gameOver: "Fin del juego",
    congratulations: "¡Felicitaciones!",
    tryAgain: "Intentar de nuevo",
    continue: "Continuar",
    
    // Profile & Settings
    sound: "Sonido",
    music: "Música",
    language: "Idioma",
    selectLanguage: "Seleccionar Idioma",
    account: "Cuenta",
    friends: "Amigos",
    invitations: "Invitaciones",
    faq: "FAQ",
    showOnboarding: "Mostrar Onboarding",
    waitingForAdmin: "Esperando al admin oso...",
    
    // Game Modes
    solo: "Individual",
    group: "Grupo",
    duel: "Duelo",
    multiplayer: "Multijugador",
    
    // Categories
    science: "Ciencia",
    history: "Historia",
    sports: "Deportes",
    geography: "Geografía",
    media: "Medios",
    culture: "Cultura",
    dailyLife: "Vida Diaria",
    custom: "Personalizado",
    
    // Difficulty
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
    
    // Multiplayer
    room: "Sala",
    roomId: "ID de Sala",
    joinRoom: "Unirse a Sala",
    createRoom: "Crear Sala",
    leaveRoom: "Salir de Sala",
    host: "Anfitrión",
    player: "Jugador",
    players: "Jugadores",
    waitingForPlayers: "Esperando jugadores...",
    gameStarted: "¡Juego iniciado!",
    selectCategory: "Seleccionar Categoría",
    selectedTopic: "Tema seleccionado",
    
    // Alerts & Messages
    newHost: "Nuevo Anfitrión",
    isNowHost: "es ahora el anfitrión de la sala",
    failedToGenerate: "No se pudieron generar las preguntas. Por favor, inténtalo de nuevo o verifica tu conexión a internet — o juega los mini-juegos mientras tanto.",
    checkConnection: "Verifica tu conexión a internet",
    playMiniGames: "Jugar Mini-Juegos",
    sureToCancel: "¿Estás seguro de que quieres cancelar la sala?",
    sureToLeave: "¿Estás seguro de que quieres salir de la sala?",
    loadingRoom: "Cargando sala...",
    rejoiningRoom: "Reuniéndose a la sala...",
    
    // Countdown
    countdown: "Cuenta regresiva",
    getReady: "¡Prepárate!",
    
    // Results
    finalScore: "Puntuación Final",
    correctAnswers: "Respuestas Correctas",
    totalQuestions: "Total de Preguntas",
    timeBonus: "Bonificación de Tiempo",
    perfectGame: "Juego Perfecto",
    totalPoints: "Puntos Totales",
    accuracy: "Precisión",
    
    // Buttons
    go: "Ir",
    waiting: "Esperando",
    generating: "Generando...",
    generatingQuestions: "Generando Preguntas...",
    thatsGreat: "¡Eso es genial!",
    chosenTopic: "Tema elegido",
    assignedCategory: "Categoría asignada",
    chosenLevel: "Nivel elegido",
    questionsCount: "10 preguntas, máx. 30 segundos cada una",
    maxTime: "máx. 30 segundos cada una",
    seconds: "segundos",
    
    // Statistics & Play
    goPlay: "Jugar",
    myRank: "Mi Rango",
    from: "de",
    topPlayers: "Top 10 Jugadores",
    myStatistics: "Mis estadísticas",
    quizzlyPoints: "Puntos Quizzly",
    categoryPerformance: "Rendimiento de categorías",
    pleaseLogin: "Por favor, inicia sesión para ver tus estadísticas.",
    userNotRegistered: "Este usuario aún no está registrado. Por favor, inténtalo de nuevo más tarde.",
    
    // Onboarding
    quizzlyBearsGuide: "Guía de Quizzly Bears",
    aiGenerated: "Generado por IA",
    getUniqueQuizzes: "Obtén cuestionarios únicos creados por IA",
    customTopics: "Temas personalizados",
    chooseTopicsOrOwn: "Elige de nuestros temas o ingresa los tuyos (cualquier idioma)",
    playYourWay: "Juega a tu manera",
    soloOrWithFriends: "Solo o con amigos",
    competeAndWin: "Compite y gana",
    scorePointsConnectFriends: "Gana puntos, conéctate con amigos y conviértete en el mejor semanal",
    getStarted: "Comenzar",
    
    // FAQ & Account
    frequentlyAskedQuestions: "Preguntas Frecuentes",
    accountSettings: "Configuración de la Cuenta",
    logInSignUp: "Iniciar sesión / Registrarse",
    createAccountOrLogin: "Crea una cuenta o inicia sesión para guardar tu progreso y conectarte con amigos para explorar juntos.",
    saveProgressConnectFriends: "¡Siempre puedes omitir este paso por ahora y volver más tarde!",
    skipForNow: "Omitir",
    logInWithEmail: "Iniciar sesión con correo electrónico",
    signUp: "Registrarse",
    
    // Invitations
    noInvitations: "No hay invitaciones por ahora.",
    startGameYourself: "¡Puedes iniciar una partida tú mismo!",
    gameInvitations: "Invitaciones de Juego",
    
    // Friends
    friend: "Amigo",
    emptyFriendsList: "Lamentablemente, está vacío por ahora...",
    inviteSomeone: "Invita a alguien.",
    refreshFriends: "Actualizar amigos",
    
    // Quiz Types
    playAlone: "Jugar solo",
    playDuel: "Jugar duelo",
    playGroup: "Jugar en grupo",
    miniGames: "Mini-juegos",
    
    // Category Screen
    yourTopic: "tu tema ...",
    search: "Buscar",
    orPickPreparedCategory: "O elige una categoría preparada",
    
    // Difficulty Levels
    easyCubCurious: "Fácil: Cachorro Curioso",
    mediumBearlyBrainy: "Medio: Oso Inteligente",
    hardGrizzlyGuru: "Difícil: Grizzly Guru",
    
    // Account Functions
    changePassword: "Cambiar contraseña",
    logOut: "Cerrar sesión",
    deleteAccount: "Eliminar cuenta",
    changing: "Cambiando...",
    signingOut: "Cerrando sesión...",
    deleting: "Eliminando...",
    currentPassword: "contraseña actual",
    newPassword: "nueva contraseña",
    repeatNewPassword: "repetir nueva contraseña",
    changePasswordTitle: "Cambiar contraseña",
    deleteAccountTitle: "Eliminar cuenta",
    deleteAccountMessage: "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
    deleteConfirm: "Eliminar",
    reLoginRequired: "Reconexión requerida",
    reLoginMessage: "Por seguridad, por favor, inicia sesión de nuevo para eliminar tu cuenta.",
    reLogin: "Reconectar",
    passwordChanged: "Tu contraseña ha sido cambiada.",
    googleFacebookPassword: "Has iniciado sesión con Google o Facebook. No puedes cambiar tu contraseña.",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "¿Cómo funciona el juego?",
    faqHowDoesGameWorkAnswer: "Cada ronda de juego consiste en 10 preguntas, con 30 segundos para responder cada una. La ronda total dura aproximadamente 5 minutos, más un breve tiempo para leer cada pregunta antes de que comience el temporizador.",
    faqGameModes: "¿Qué modos de juego están disponibles?",
    faqGameModesAnswer: "Ofrecemos tres tipos de juegos:\n• Modo Solo - Juega por tu cuenta, continúa tan pronto como respondas.\n• Duelo (1 vs 1) - Juega contra otro usuario en 4 rondas de 10 preguntas cada una.\n• Modo Grupo - Cada jugador juega una ronda de 10 preguntas. Hasta 7-8 participantes.",
    faqTimingAndAnswering: "¿Cómo funciona el tiempo y las respuestas?",
    faqTimingAndAnsweringAnswer: "Primero, se muestra la pregunta con unos segundos para leer. Luego aparecen las opciones de respuesta. Solo después de eso comienza el temporizador de 30 segundos. En modo solo, continúas inmediatamente después de responder. En modos multijugador, todos responden al mismo tiempo (juego sincrónico). Durante los tiempos de espera, verás una linda animación de carga de oso.",
    faqPoints: "¿Cómo se otorgan los puntos?",
    faqPointsAnswer: "Ganas puntos según la dificultad de la pregunta y qué tan rápido respondes:\n\nRespuestas Correctas:\n• Fácil: 5 QP\n• Medio: 10 QP\n• Difícil: 15 QP\n\nBono de Tiempo:\n• Respuesta en menos de 5 seg: +5 QP\n• Respuesta en menos de 10 seg: +3 QP\n• Respuesta en menos de 20 seg: +1 QP\n\nBono de Ronda Perfecta:\n• Las 10 preguntas correctas: +50 QP",
    faqRewards: "¿Hay recompensas?",
    faqRewardsAnswer: "¡Sí! Recompensamos el rendimiento:\n\nTop 3 de la semana: Recibe medallas (bronce, plata, oro) mostradas en tu perfil. ¡Cada una viene con un trofeo Quizzly Bear!\n\nPrecisión superior (por ejemplo, top 10% o 20%): Obtén un icono de pata junto a tu nombre de usuario. Se muestra en todos los juegos y clasificaciones. La pata desaparece si caes por debajo del umbral en la siguiente semana.",
    faqStats: "¿Puedo seguir mis estadísticas?",
    faqStatsAnswer: "¡Sí! Tu perfil muestra:\n• Puntos totales\n• Precisión\n• Clasificaciones semanales\n• Medallas y recompensas\n\n¡Siempre actualizado!",
    faqChallenges: "¿Hay desafíos especiales?",
    faqChallengesAnswer: "¡Los 10 mejores jugadores de la semana pueden desbloquear un cuestionario extra difícil como desafío personal! Esta es una función opcional que estamos probando actualmente.",
    faqFriends: "¿Cómo puedo agregar amigos?",
    faqFriendsAnswer: "• Busca amigos por nombre de usuario o dirección de correo electrónico.\n• Envía una solicitud de amistad - el otro usuario debe aceptar.\n• Si tu amigo aún no tiene la aplicación, puedes enviar una invitación por correo electrónico.",
  },
  
  fr: {
    // Navigation & Common
    play: "Jouer",
    profile: "Profil",
    settings: "Paramètres",
    back: "Retour",
    cancel: "Annuler",
    confirm: "Confirmer",
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    close: "Fermer",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    
    // Quiz Related
    start: "Commencer",
    next: "Suivant",
    submit: "Soumettre",
    answer: "Réponse",
    question: "Question",
    score: "Score",
    points: "Points",
    time: "Temps",
    timer: "Minuteur",
    correct: "Correct !",
    incorrect: "Incorrect",
    gameOver: "Fin de partie",
    congratulations: "Félicitations !",
    tryAgain: "Réessayer",
    continue: "Continuer",
    
    // Profile & Settings
    sound: "Son",
    music: "Musique",
    language: "Langue",
    selectLanguage: "Sélectionner la langue",
    account: "Compte",
    friends: "Amis",
    invitations: "Invitations",
    faq: "FAQ",
    showOnboarding: "Afficher l'introduction",
    waitingForAdmin: "En attente de l'admin ours...",
    
    // Game Modes
    solo: "Solo",
    group: "Groupe",
    duel: "Duel",
    multiplayer: "Multijoueur",
    
    // Categories
    science: "Science",
    history: "Histoire",
    sports: "Sport",
    geography: "Géographie",
    media: "Médias",
    culture: "Culture",
    dailyLife: "Vie Quotidienne",
    custom: "Personnalisé",
    
    // Difficulty
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
    
    // Multiplayer
    room: "Salle",
    roomId: "ID de Salle",
    joinRoom: "Rejoindre une Salle",
    createRoom: "Créer une Salle",
    leaveRoom: "Quitter la Salle",
    host: "Hôte",
    player: "Joueur",
    players: "Joueurs",
    waitingForPlayers: "En attente de joueurs...",
    gameStarted: "Partie commencée !",
    selectCategory: "Sélectionner une Catégorie",
    selectedTopic: "Sujet sélectionné",
    
    // Alerts & Messages
    newHost: "Nouvel Hôte",
    isNowHost: "est maintenant l'hôte de la salle",
    failedToGenerate: "Impossible de générer les questions. Veuillez réessayer ou vérifier votre connexion internet — ou jouer aux mini-jeux en attendant.",
    checkConnection: "Vérifiez votre connexion internet",
    playMiniGames: "Jouer aux Mini-Jeux",
    sureToCancel: "Êtes-vous sûr de vouloir annuler la salle ?",
    sureToLeave: "Êtes-vous sûr de vouloir quitter la salle ?",
    loadingRoom: "Chargement de la salle...",
    rejoiningRoom: "Rejoindre la salle...",
    
    // Countdown
    countdown: "Compte à rebours",
    getReady: "Préparez-vous !",
    
    // Results
    finalScore: "Score Final",
    correctAnswers: "Réponses Correctes",
    totalQuestions: "Total des Questions",
    timeBonus: "Bonus de Temps",
    perfectGame: "Partie Parfaite",
    totalPoints: "Points Totaux",
    accuracy: "Précision",
    
    // Buttons
    go: "Aller",
    waiting: "En attente",
    generating: "Génération...",
    generatingQuestions: "Génération de Questions...",
    thatsGreat: "C'est génial !",
    chosenTopic: "Sujet choisi",
    assignedCategory: "Catégorie assignée",
    chosenLevel: "Niveau choisi",
    questionsCount: "10 questions, max 30 secondes chacune",
    maxTime: "max 30 secondes chacune",
    seconds: "secondes",
    
    // Statistics & Play
    goPlay: "Jouer",
    myRank: "Mon Rang",
    from: "de",
    topPlayers: "Top 10 Joueurs",
    myStatistics: "Mes statistiques",
    quizzlyPoints: "Points Quizzly",
    categoryPerformance: "Performance des catégories",
    pleaseLogin: "Veuillez vous connecter pour voir vos statistiques.",
    userNotRegistered: "Cet utilisateur n'est pas encore enregistré. Veuillez réessayer plus tard.",
    
    // Onboarding
    quizzlyBearsGuide: "Guide Quizzly Bears",
    aiGenerated: "Généré par IA",
    getUniqueQuizzes: "Obtenez des quiz uniques créés par l'IA",
    customTopics: "Sujets personnalisés",
    chooseTopicsOrOwn: "Choisissez parmi nos sujets ou entrez les vôtres (toute langue)",
    playYourWay: "Jouez à votre façon",
    soloOrWithFriends: "Solo ou avec des amis",
    competeAndWin: "Rivalisez et gagnez",
    scorePointsConnectFriends: "Marquez des points, connectez-vous avec des amis et devenez le meilleur de la semaine",
    getStarted: "Commencer",
    
    // FAQ & Account
    frequentlyAskedQuestions: "Questions Fréquemment Posées",
    accountSettings: "Paramètres du Compte",
    logInSignUp: "Connexion / Inscription",
    createAccountOrLogin: "Créez un compte ou connectez-vous pour sauvegarder votre progression et vous connecter avec des amis pour explorer ensemble.",
    saveProgressConnectFriends: "Vous pouvez toujours sauter cette étape maintenant et revenir plus tard !",
    skipForNow: "Passer",
    logInWithEmail: "Se connecter avec e-mail",
    signUp: "S'inscrire",
    
    // Invitations
    noInvitations: "Aucune invitation pour le moment.",
    startGameYourself: "Tu peux démarrer une partie toi-même !",
    gameInvitations: "Invitations de Jeu",
    
    // Friends
    friend: "Ami",
    emptyFriendsList: "Malheureusement, c'est vide pour l'instant...",
    inviteSomeone: "Invite quelqu'un.",
    refreshFriends: "Actualiser les amis",
    
    // Quiz Types
    playAlone: "Jouer seul",
    playDuel: "Jouer un duel",
    playGroup: "Jouer en groupe",
    miniGames: "Mini-jeux",
    
    // Category Screen
    yourTopic: "ton sujet ...",
    search: "Rechercher",
    orPickPreparedCategory: "Ou choisir une catégorie préparée",
    
    // Difficulty Levels
    easyCubCurious: "Facile: Ourson Curieux",
    mediumBearlyBrainy: "Moyen: Ours Intelligent",
    hardGrizzlyGuru: "Difficile: Grizzly Guru",
    
    // Account Functions
    changePassword: "Changer le mot de passe",
    logOut: "Déconnexion",
    deleteAccount: "Supprimer le compte",
    changing: "Changement de mot de passe...",
    signingOut: "Déconnexion...",
    deleting: "Suppression...",
    currentPassword: "mot de passe actuel",
    newPassword: "nouveau mot de passe",
    repeatNewPassword: "répéter le nouveau mot de passe",
    changePasswordTitle: "Changer le mot de passe",
    deleteAccountTitle: "Supprimer le compte",
    deleteAccountMessage: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.",
    deleteConfirm: "Supprimer",
    reLoginRequired: "Connexion requise",
    reLoginMessage: "Pour des raisons de sécurité, veuillez vous reconnecter pour supprimer votre compte.",
    reLogin: "Reconnexion",
    passwordChanged: "Votre mot de passe a été changé.",
    googleFacebookPassword: "Vous vous êtes connecté avec Google ou Facebook. Vous ne pouvez pas changer votre mot de passe.",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "Comment fonctionne le jeu ?",
    faqHowDoesGameWorkAnswer: "Chaque partie se compose de 10 questions, avec 30 secondes pour répondre à chacune. La partie complète dure environ 5 minutes, plus un court temps de lecture pour chaque question avant le début du chronomètre.",
    faqGameModes: "Quels modes de jeu sont disponibles ?",
    faqGameModesAnswer: "Nous proposons trois types de jeux :\n• Mode Solo - Jouez seul, continuez dès que vous répondez.\n• Duel (1 contre 1) - Jouez contre un autre utilisateur en 4 manches de 10 questions chacune.\n• Mode Groupe - Chaque joueur joue une manche de 10 questions. Jusqu'à 7-8 participants.",
    faqTimingAndAnswering: "Comment fonctionnent le chronométrage et les réponses ?",
    faqTimingAndAnsweringAnswer: "D'abord, la question est affichée avec quelques secondes de lecture. Ensuite, les options de réponse apparaissent. Ce n'est qu'après que le chronomètre de 30 secondes démarre. En mode solo, vous continuez immédiatement après avoir répondu. En modes multijoueurs, tout le monde répond en même temps (jeu synchrone). Pendant les temps d'attente, vous verrez une mignonne animation de chargement d'ours.",
    faqPoints: "Comment les points sont-ils attribués ?",
    faqPointsAnswer: "Vous gagnez des points en fonction de la difficulté de la question et de la rapidité de votre réponse :\n\nRéponses Correctes :\n• Facile : 5 QP\n• Moyen : 10 QP\n• Difficile : 15 QP\n\nBonus de Temps :\n• Réponse en moins de 5 sec : +5 QP\n• Réponse en moins de 10 sec : +3 QP\n• Réponse en moins de 20 sec : +1 QP\n\nBonus de Manche Parfaite :\n• Les 10 questions correctes : +50 QP",
    faqRewards: "Y a-t-il des récompenses ?",
    faqRewardsAnswer: "Oui ! Nous récompensons la performance :\n\nTop 3 de la semaine : Recevez des médailles (bronze, argent, or) affichées sur votre profil. Chacune est accompagnée d'un trophée Quizzly Bear !\n\nPrécision supérieure (par exemple, top 10% ou 20%) : Obtenez une icône de patte à côté de votre nom d'utilisateur. Affichée dans tous les jeux et classements. La patte disparaît si vous passez sous le seuil la semaine suivante.",
    faqStats: "Puis-je suivre mes statistiques ?",
    faqStatsAnswer: "Oui ! Votre profil affiche :\n• Points totaux\n• Précision\n• Classements hebdomadaires\n• Médailles et récompenses\n\nToujours à jour !",
    faqChallenges: "Y a-t-il des défis spéciaux ?",
    faqChallengesAnswer: "Les 10 meilleurs joueurs de la semaine peuvent débloquer un quiz extra difficile comme défi personnel ! C'est une fonctionnalité optionnelle que nous testons actuellement.",
    faqFriends: "Comment puis-je ajouter des amis ?",
    faqFriendsAnswer: "• Recherchez des amis par nom d'utilisateur ou adresse e-mail.\n• Envoyez une demande d'ami - l'autre utilisateur doit accepter.\n• Si votre ami n'a pas encore l'application, vous pouvez envoyer une invitation par e-mail.",
  },
  ru: {
    // Navigation & Common
    play: "Играть",
    profile: "Профиль",
    settings: "Настройки",
    back: "Назад",
    cancel: "Отмена",
    confirm: "Подтвердить",
    save: "Сохранить",
    delete: "Удалить",
    edit: "Редактировать",
    close: "Закрыть",
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успех",
    
    // Quiz Related
    start: "Начать",
    next: "Далее",
    submit: "Отправить",
    answer: "Ответ",
    question: "Вопрос",
    score: "Счёт",
    points: "Очки",
    time: "Время",
    timer: "Таймер",
    correct: "Правильно!",
    incorrect: "Неправильно",
    gameOver: "Игра окончена",
    congratulations: "Поздравляем!",
    tryAgain: "Попробовать снова",
    continue: "Продолжить",
    
    // Profile & Settings
    sound: "Звук",
    music: "Музыка",
    language: "Язык",
    selectLanguage: "Выбрать язык",
    account: "Аккаунт",
    friends: "Друзья",
    invitations: "Приглашения",
    faq: "FAQ",
    showOnboarding: "Показать обучение",
    waitingForAdmin: "Ожидание админа медведя...",
    
    // Game Modes
    solo: "Одиночная игра",
    group: "Группа",
    duel: "Дуэль",
    multiplayer: "Мультиплеер",
    
    // Categories
    science: "Наука",
    history: "История",
    sports: "Спорт",
    geography: "География",
    media: "Медиа",
    culture: "Культура",
    dailyLife: "Повседневная жизнь",
    custom: "Пользовательский",
    
    // Difficulty
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    
    // Multiplayer
    room: "Комната",
    roomId: "ID комнаты",
    joinRoom: "Присоединиться к комнате",
    createRoom: "Создать комнату",
    leaveRoom: "Покинуть комнату",
    host: "Хост",
    player: "Игрок",
    players: "Игроки",
    waitingForPlayers: "Ожидание игроков...",
    gameStarted: "Игра началась!",
    selectCategory: "Выбрать категорию",
    selectedTopic: "Выбранная тема",
    
    // Alerts & Messages
    newHost: "Новый хост",
    isNowHost: "теперь является хостом комнаты",
    failedToGenerate: "Не удалось сгенерировать вопросы. Пожалуйста, попробуйте снова или проверьте подключение к интернету — или поиграйте в мини-игры пока.",
    checkConnection: "Проверьте подключение к интернету",
    playMiniGames: "Играть в мини-игры",
    sureToCancel: "Вы уверены, что хотите отменить комнату?",
    sureToLeave: "Вы уверены, что хотите покинуть комнату?",
    loadingRoom: "Загрузка комнаты...",
    rejoiningRoom: "Повторное присоединение к комнате...",
    
    // Countdown
    countdown: "Обратный отсчёт",
    getReady: "Приготовьтесь!",
    
    // Results
    finalScore: "Финальный счёт",
    correctAnswers: "Правильные ответы",
    totalQuestions: "Всего вопросов",
    timeBonus: "Бонус времени",
    perfectGame: "Идеальная игра",
    totalPoints: "Всего очков",
    accuracy: "Точность",
    
    // Buttons
    go: "Вперёд",
    waiting: "Ожидание",
    generating: "Генерация...",
    generatingQuestions: "Генерация вопросов...",
    thatsGreat: "Это отлично!",
    chosenTopic: "Выбранная тема",
    assignedCategory: "Назначенная категория",
    chosenLevel: "Выбранный уровень",
    questionsCount: "10 вопросов, макс. 30 секунд каждый",
    maxTime: "макс. 30 секунд каждый",
    seconds: "секунд",
    
    // Statistics & Play
    goPlay: "Играть",
    myRank: "Мой ранг",
    from: "из",
    topPlayers: "Топ 10 игроков",
    myStatistics: "Мои статистики",
    quizzlyPoints: "Очки Quizzly",
    categoryPerformance: "Выполнение по категориям",
    pleaseLogin: "Пожалуйста, войдите, чтобы увидеть свои статистики.",
    userNotRegistered: "Этот пользователь еще не зарегистрирован. Пожалуйста, попробуйте позже.",
    
    // Onboarding
    quizzlyBearsGuide: "Руководство Quizzly Bears",
    aiGenerated: "Создано ИИ",
    getUniqueQuizzes: "Получайте уникальные викторины, созданные ИИ",
    customTopics: "Пользовательские темы",
    chooseTopicsOrOwn: "Выбирайте из наших тем или вводите свои (любой язык)",
    playYourWay: "Играйте по-своему",
    soloOrWithFriends: "Одиночная игра или с друзьями",
    competeAndWin: "Соревнуйтесь и побеждайте",
    scorePointsConnectFriends: "Зарабатывайте очки, общайтесь с друзьями и станьте лучшим за неделю",
    getStarted: "Начать",
    
    // FAQ & Account
    frequentlyAskedQuestions: "Часто Задаваемые Вопросы",
    accountSettings: "Настройки Аккаунта",
    logInSignUp: "Вход / Регистрация",
    createAccountOrLogin: "Создайте аккаунт или войдите, чтобы сохранить свой прогресс и подключиться к друзьям для совместного исследования.",
    saveProgressConnectFriends: "Вы всегда можете пропустить этот шаг сейчас и вернуться позже!",
    skipForNow: "Пропустить",
    logInWithEmail: "Войти по электронной почте",
    signUp: "Зарегистрироваться",
    
    // Invitations
    noInvitations: "Нет приглашений на данный момент.",
    startGameYourself: "Вы можете начать игру сами!",
    gameInvitations: "Приглашения к игре",
    
    // Friends
    friend: "Друг",
    emptyFriendsList: "К сожалению, этот список пуст...",
    inviteSomeone: "Пригласите кого-нибудь.",
    refreshFriends: "Обновить друзей",
    
    // Quiz Types
    playAlone: "Играть одному",
    playDuel: "Играть дуэль",
    playGroup: "Играть в группе",
    miniGames: "Мини-игры",
    
    // Category Screen
    yourTopic: "твоя тема ...",
    search: "Поиск",
    orPickPreparedCategory: "Или выберите готовую категорию",
    
    // Difficulty Levels
    easyCubCurious: "Легко: Любопытный Медвежонок",
    mediumBearlyBrainy: "Средне: Умный Медведь",
    hardGrizzlyGuru: "Сложно: Гризли Гуру",
    
    // Account Functions
    changePassword: "Изменить пароль",
    logOut: "Выйти",
    deleteAccount: "Удалить аккаунт",
    changing: "Изменение...",
    signingOut: "Выход...",
    deleting: "Удаление...",
    currentPassword: "текущий пароль",
    newPassword: "новый пароль",
    repeatNewPassword: "повторить новый пароль",
    changePasswordTitle: "Изменить пароль",
    deleteAccountTitle: "Удалить аккаунт",
    deleteAccountMessage: "Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.",
    deleteConfirm: "Удалить",
    reLoginRequired: "Требуется повторная авторизация",
    reLoginMessage: "Для безопасности, пожалуйста, войдите снова, чтобы удалить ваш аккаунт.",
    reLogin: "Повторная авторизация",
    passwordChanged: "Ваш пароль был изменён.",
    googleFacebookPassword: "Вы вошли с помощью Google или Facebook. Вы не можете изменить свой пароль.",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "Как работает игра?",
    faqHowDoesGameWorkAnswer: "Каждый раунд игры состоит из 10 вопросов, с 30 секундами на ответ на каждый. Весь раунд длится около 5 минут, плюс короткое время на прочтение каждого вопроса перед началом отсчета времени.",
    faqGameModes: "Какие игровые режимы доступны?",
    faqGameModesAnswer: "Мы предлагаем три типа игр:\n• Одиночный режим - Играйте самостоятельно, продолжайте сразу после ответа.\n• Дуэль (1 против 1) - Играйте против другого пользователя в 4 раунда по 10 вопросов каждый.\n• Групповой режим - Каждый игрок играет один раунд из 10 вопросов. До 7-8 участников.",
    faqTimingAndAnswering: "Как работает время и ответы?",
    faqTimingAndAnsweringAnswer: "Сначала показывается вопрос с несколькими секундами на чтение. Затем появляются варианты ответов. Только после этого начинается 30-секундный таймер. В одиночном режиме вы продолжаете сразу после ответа. В многопользовательских режимах все отвечают одновременно (синхронная игра). Во время ожидания вы увидите милую анимацию загрузки с медведем.",
    faqPoints: "Как начисляются очки?",
    faqPointsAnswer: "Вы получаете очки в зависимости от сложности вопроса и скорости ответа:\n\nПравильные ответы:\n• Легкий: 5 QP\n• Средний: 10 QP\n• Сложный: 15 QP\n\nБонус за время:\n• Ответ менее 5 сек: +5 QP\n• Ответ менее 10 сек: +3 QP\n• Ответ менее 20 сек: +1 QP\n\nБонус за идеальный раунд:\n• Все 10 вопросов правильно: +50 QP",
    faqRewards: "Есть ли награды?",
    faqRewardsAnswer: "Да! Мы награждаем за результаты:\n\nТоп-3 недели: Получите медали (бронза, серебро, золото), отображаемые в вашем профиле. Каждая приходит с трофеем Quizzly Bear!\n\nВысокая точность (например, топ 10% или 20%): Получите значок лапы рядом с вашим именем пользователя. Отображается во всех играх и рейтингах. Лапа исчезает, если вы опускаетесь ниже порога на следующей неделе.",
    faqStats: "Могу ли я отслеживать свою статистику?",
    faqStatsAnswer: "Да! Ваш профиль показывает:\n• Общие очки\n• Точность\n• Еженедельные рейтинги\n• Медали и награды\n\nВсегда актуально!",
    faqChallenges: "Есть ли особые испытания?",
    faqChallengesAnswer: "Топ-10 игроков недели могут разблокировать экстра-сложную викторину как личное испытание! Это дополнительная функция, которую мы сейчас тестируем.",
    faqFriends: "Как добавить друзей?",
    faqFriendsAnswer: "• Ищите друзей по имени пользователя или электронной почте.\n• Отправьте запрос в друзья - другой пользователь должен принять его.\n• Если у вашего друга еще нет приложения, вы можете отправить приглашение по электронной почте.",
  },
  ar: {
    // Navigation & Common
    play: "اللعب",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    back: "رجوع",
    cancel: "إلغاء",
    confirm: "تأكيد",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    close: "إغلاق",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    
    // Quiz Related
    start: "ابدأ",
    next: "التالي",
    submit: "إرسال",
    answer: "إجابة",
    question: "سؤال",
    score: "النتيجة",
    points: "النقاط",
    time: "الوقت",
    timer: "المؤقت",
    correct: "صحيح!",
    incorrect: "خطأ",
    gameOver: "انتهت اللعبة",
    congratulations: "تهانينا!",
    tryAgain: "حاول مرة أخرى",
    continue: "استمر",
    
    // Profile & Settings
    sound: "الصوت",
    music: "الموسيقى",
    language: "اللغة",
    selectLanguage: "اختر اللغة",
    account: "الحساب",
    friends: "الأصدقاء",
    invitations: "الدعوات",
    faq: "الأسئلة الشائعة",
    showOnboarding: "عرض التعريف",
    waitingForAdmin: "في انتظار الدب المشرف...",
    
    // Game Modes
    solo: "فردي",
    group: "مجموعة",
    duel: "مبارزة",
    multiplayer: "متعدد اللاعبين",
    
    // Categories
    science: "العلوم",
    history: "التاريخ",
    sports: "الرياضة",
    geography: "الجغرافيا",
    media: "الوسائط",
    culture: "الثقافة",
    dailyLife: "الحياة اليومية",
    custom: "مخصص",
    
    // Difficulty
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    
    // Multiplayer
    room: "الغرفة",
    roomId: "معرف الغرفة",
    joinRoom: "انضم إلى الغرفة",
    createRoom: "إنشاء غرفة",
    leaveRoom: "مغادرة الغرفة",
    host: "المضيف",
    player: "اللاعب",
    players: "اللاعبون",
    waitingForPlayers: "في انتظار اللاعبين...",
    gameStarted: "بدأت اللعبة!",
    selectCategory: "اختر الفئة",
    selectedTopic: "الموضوع المختار",
    
    // Alerts & Messages
    newHost: "مضيف جديد",
    isNowHost: "هو الآن مضيف الغرفة",
    failedToGenerate: "فشل في إنشاء الأسئلة. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت — أو العب الألعاب المصغرة في هذه الأثناء.",
    checkConnection: "تحقق من اتصال الإنترنت",
    playMiniGames: "العب الألعاب المصغرة",
    sureToCancel: "هل أنت متأكد من أنك تريد إلغاء الغرفة؟",
    sureToLeave: "هل أنت متأكد من أنك تريد مغادرة الغرفة؟",
    loadingRoom: "جاري تحميل الغرفة...",
    rejoiningRoom: "إعادة الانضمام إلى الغرفة...",
    
    // Countdown
    countdown: "العد التنازلي",
    getReady: "استعد!",
    
    // Results
    finalScore: "النتيجة النهائية",
    correctAnswers: "الإجابات الصحيحة",
    totalQuestions: "إجمالي الأسئلة",
    timeBonus: "مكافأة الوقت",
    perfectGame: "لعبة مثالية",
    totalPoints: "إجمالي النقاط",
    accuracy: "دقة",
    
    // Buttons
    go: "اذهب",
    waiting: "في الانتظار",
    generating: "جاري الإنشاء...",
    generatingQuestions: "جاري إنشاء الأسئلة...",
    thatsGreat: "هذا رائع!",
    chosenTopic: "الموضوع المختار",
    assignedCategory: "الفئة المعينة",
    chosenLevel: "المستوى المختار",
    questionsCount: "10 أسئلة، أقصى 30 ثانية لكل سؤال",
    maxTime: "أقصى 30 ثانية لكل سؤال",
    seconds: "ثانية",
    
    // Statistics & Play
    goPlay: "العب",
    myRank: "رتبتي",
    from: "من",
    topPlayers: "أعلى 10 لاعبين",
    myStatistics: "إحصائياتي",
    quizzlyPoints: "نقاط Quizzly",
    categoryPerformance: "أداء الفئات",
    pleaseLogin: "الرجاء تسجيل الدخول لعرض إحصائياتك.",
    userNotRegistered: "هذا المستخدم غير مسجل بعد. الرجاء المحاولة مرة أخرى لاحقاً.",
    
    // Onboarding
    quizzlyBearsGuide: "دليل Quizzly Bears",
    aiGenerated: "مُنشأ بواسطة الذكاء الاصطناعي",
    getUniqueQuizzes: "احصل على اختبارات فريدة منشأة بواسطة الذكاء الاصطناعي",
    customTopics: "مواضيع مخصصة",
    chooseTopicsOrOwn: "اختر من مواضيعنا أو أدخل مواضيعك الخاصة (أي لغة)",
    playYourWay: "العب بطريقتك",
    soloOrWithFriends: "فردي أو مع الأصدقاء",
    competeAndWin: "تنافس واربح",
    scorePointsConnectFriends: "اجمع النقاط، تواصل مع الأصدقاء وكن الأفضل أسبوعياً",
    getStarted: "ابدأ",
    
    // FAQ & Account
    frequentlyAskedQuestions: "الأسئلة الشائعة",
    accountSettings: "إعدادات الحساب",
    logInSignUp: "تسجيل الدخول / التسجيل",
    createAccountOrLogin: "أنشئ حسابًا أو سجل الدخول لحفظ تقدمك والتواصل مع الأصدقاء للاستكشاف معًا.",
    saveProgressConnectFriends: "يمكنك دائمًا تخطي هذه الخطوة الآن والعودة لاحقًا!",
    skipForNow: "تخطي",
    logInWithEmail: "تسجيل الدخول بالبريد الإلكتروني",
    signUp: "التسجيل",
    
    // Invitations
    noInvitations: "لا توجد دعوات حالياً.",
    startGameYourself: "يمكنك بدء لعبة بنفسك!",
    gameInvitations: "دعوات الألعاب",
    
    // Friends
    friend: "صديق",
    emptyFriendsList: "عذراً، هذا القائمة فارغة حتى الآن...",
    inviteSomeone: "دعوة الأشخاص.",
    refreshFriends: "تحديث الأصدقاء",
    
    // Quiz Types
    playAlone: "اللعب وحيداً",
    playDuel: "اللعب مبارزة",
    playGroup: "اللعب في مجموعة",
    miniGames: "ألعاب مصغرة",
    
    // Category Screen
    yourTopic: "موضوعك ...",
    search: "بحث",
    orPickPreparedCategory: "أو اختر فئة جاهزة",
    
    // Difficulty Levels
    easyCubCurious: "سهل: دب فضولي",
    mediumBearlyBrainy: "متوسط: دب ذكي",
    hardGrizzlyGuru: "صعب: غريزلي غورو",
    
    // Account Functions
    changePassword: "تغيير كلمة المرور",
    logOut: "تسجيل الخروج",
    deleteAccount: "حذف الحساب",
    changing: "يتم التغيير...",
    signingOut: "تسجيل الخروج...",
    deleting: "يتم الحذف...",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    repeatNewPassword: "كرر كلمة المرور الجديدة",
    changePasswordTitle: "تغيير كلمة المرور",
    deleteAccountTitle: "حذف الحساب",
    deleteAccountMessage: "هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.",
    deleteConfirm: "حذف",
    reLoginRequired: "التسجيل مطلوب مرة أخرى",
    reLoginMessage: "للأمان، يرجى تسجيل الدخول مرة أخرى لحذف حسابك.",
    reLogin: "تسجيل مرة أخرى",
    passwordChanged: "تم تغيير كلمة المرور الخاصة بك.",
    googleFacebookPassword: "لقد قمت بتسجيل الدخول باستخدام Google أو Facebook. لا يمكنك تغيير كلمة المرور الخاصة بك.",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "كيف تعمل اللعبة؟",
    faqHowDoesGameWorkAnswer: "تتكون كل جولة من 10 أسئلة، مع 30 ثانية للإجابة على كل سؤال. تستغرق الجولة الكاملة حوالي 5 دقائق، بالإضافة إلى وقت قصير لقراءة كل سؤال قبل بدء العد التنازلي.",
    faqGameModes: "ما هي أنماط اللعب المتاحة؟",
    faqGameModesAnswer: "نقدم ثلاثة أنواع من الألعاب:\n• وضع فردي - العب بمفردك، استمر بمجرد الإجابة.\n• مبارزة (1 ضد 1) - العب ضد مستخدم آخر في 4 جولات من 10 أسئلة لكل منها.\n• وضع المجموعة - يلعب كل لاعب جولة واحدة من 10 أسئلة. حتى 7-8 مشاركين.",
    faqTimingAndAnswering: "كيف يعمل التوقيت والإجابة؟",
    faqTimingAndAnsweringAnswer: "أولاً، يتم عرض السؤال مع بضع ثوانٍ للقراءة. ثم تظهر خيارات الإجابة. فقط بعد ذلك يبدأ العد التنازلي لمدة 30 ثانية. في الوضع الفردي، تستمر مباشرة بعد الإجابة. في الأوضاع متعددة اللاعبين، يجيب الجميع في نفس الوقت (لعب متزامن). خلال أوقات الانتظار، سترى رسوم متحركة لطيفة لتحميل الدب.",
    faqPoints: "كيف يتم منح النقاط؟",
    faqPointsAnswer: "تكسب النقاط بناءً على صعوبة السؤال وسرعة إجابتك:\n\nالإجابات الصحيحة:\n• سهل: 5 نقاط\n• متوسط: 10 نقاط\n• صعب: 15 نقطة\n\nمكافأة الوقت:\n• إجابة في أقل من 5 ثوانٍ: +5 نقاط\n• إجابة في أقل من 10 ثوانٍ: +3 نقاط\n• إجابة في أقل من 20 ثانية: +1 نقطة\n\nمكافأة الجولة المثالية:\n• جميع الأسئلة العشرة صحيحة: +50 نقطة",
    faqRewards: "هل هناك مكافآت؟",
    faqRewardsAnswer: "نعم! نكافئ الأداء:\n\nأفضل 3 في الأسبوع: احصل على ميداليات (برونزية، فضية، ذهبية) تظهر في ملفك الشخصي. كل واحدة تأتي مع كأس Quizzly Bear!\n\nدقة عالية (مثل أفضل 10٪ أو 20٪): احصل على أيقونة مخلب بجانب اسم المستخدم الخاص بك. تظهر في جميع الألعاب والتصنيفات. يختفي المخلب إذا انخفضت تحت العتبة في الأسبوع التالي.",
    faqStats: "هل يمكنني تتبع إحصائياتي؟",
    faqStatsAnswer: "نعم! يعرض ملفك الشخصي:\n• مجموع النقاط\n• الدقة\n• التصنيفات الأسبوعية\n• الميداليات والمكافآت\n\nدائماً محدثة!",
    faqChallenges: "هل هناك تحديات خاصة؟",
    faqChallengesAnswer: "قد يفتح أفضل 10 لاعبين في الأسبوع اختباراً صعباً للغاية كتحدٍ شخصي! هذه ميزة اختيارية نختبرها حالياً.",
    faqFriends: "كيف يمكنني إضافة أصدقاء؟",
    faqFriendsAnswer: "• ابحث عن الأصدقاء باستخدام اسم المستخدم أو البريد الإلكتروني.\n• أرسل طلب صداقة - يجب أن يقبل المستخدم الآخر.\n• إذا لم يكن لدى صديقك التطبيق بعد، يمكنك إرسال دعوة عبر البريد الإلكتروني.",
  },
  zh: {
    // Navigation & Common
    play: "游戏",
    profile: "个人资料",
    settings: "设置",
    back: "返回",
    cancel: "取消",
    confirm: "确认",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    close: "关闭",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    
    // Quiz Related
    start: "开始",
    next: "下一个",
    submit: "提交",
    answer: "答案",
    question: "问题",
    score: "分数",
    points: "积分",
    time: "时间",
    timer: "计时器",
    correct: "正确！",
    incorrect: "错误",
    gameOver: "游戏结束",
    congratulations: "恭喜！",
    tryAgain: "再试一次",
    continue: "继续",
    
    // Profile & Settings
    sound: "声音",
    music: "音乐",
    language: "语言",
    selectLanguage: "选择语言",
    account: "账户",
    friends: "朋友",
    invitations: "邀请",
    faq: "常见问题",
    showOnboarding: "显示引导",
    waitingForAdmin: "等待管理员熊...",
    
    // Game Modes
    solo: "单人",
    group: "组队",
    duel: "对决",
    multiplayer: "多人游戏",
    
    // Categories
    science: "科学",
    history: "历史",
    sports: "体育",
    geography: "地理",
    media: "媒体",
    culture: "文化",
    dailyLife: "日常生活",
    custom: "自定义",
    
    // Difficulty
    easy: "简单",
    medium: "中等",
    hard: "困难",
    
    // Multiplayer
    room: "房间",
    roomId: "房间ID",
    joinRoom: "加入房间",
    createRoom: "创建房间",
    leaveRoom: "离开房间",
    host: "房主",
    player: "玩家",
    players: "玩家",
    waitingForPlayers: "等待玩家...",
    gameStarted: "游戏开始！",
    selectCategory: "选择类别",
    selectedTopic: "选定主题",
    
    // Alerts & Messages
    newHost: "新房主",
    isNowHost: "现在是房间房主",
    failedToGenerate: "生成问题失败。请重试或检查网络连接 — 或者在此期间玩小游戏。",
    checkConnection: "检查网络连接",
    playMiniGames: "玩小游戏",
    sureToCancel: "您确定要取消房间吗？",
    sureToLeave: "您确定要离开房间吗？",
    loadingRoom: "加载房间中...",
    rejoiningRoom: "重新加入房间...",
    
    // Countdown
    countdown: "倒计时",
    getReady: "准备！",
    
    // Results
    finalScore: "最终分数",
    correctAnswers: "正确答案",
    totalQuestions: "总问题数",
    timeBonus: "时间奖励",
    perfectGame: "完美游戏",
    totalPoints: "总积分",
    accuracy: "准确率",
    
    // Buttons
    go: "开始",
    waiting: "等待中",
    generating: "生成中...",
    generatingQuestions: "生成问题中...",
    thatsGreat: "太棒了！",
    chosenTopic: "选定主题",
    assignedCategory: "分配类别",
    chosenLevel: "选定级别",
    questionsCount: "10个问题，每题最多30秒",
    maxTime: "每题最多30秒",
    seconds: "秒",
    
    // Statistics & Play
    goPlay: "游戏",
    myRank: "我的排名",
    from: "从",
    topPlayers: "Top 10 Players",
    myStatistics: "我的统计",
    quizzlyPoints: "Quizzly Points",
    categoryPerformance: "Category performance",
    pleaseLogin: "请登录查看您的统计数据。",
    userNotRegistered: "此用户尚未注册。请稍后再试。",
    
    // Onboarding
    quizzlyBearsGuide: "Quizzly Bears 指南",
    aiGenerated: "AI 生成",
    getUniqueQuizzes: "获得由 AI 创建的独特测验",
    customTopics: "自定义主题",
    chooseTopicsOrOwn: "从我们的主题中选择或输入您自己的主题（任何语言）",
    playYourWay: "按您的方式游戏",
    soloOrWithFriends: "单人游戏或与朋友一起",
    competeAndWin: "竞争并获胜",
    scorePointsConnectFriends: "获得积分，与朋友联系，成为每周最佳",
    getStarted: "开始",
    
    // FAQ & Account
    frequentlyAskedQuestions: "常见问题",
    accountSettings: "账户设置",
    logInSignUp: "登录 / 注册",
    createAccountOrLogin: "创建账户或登录以保存您的进度并与朋友一起探索。",
    saveProgressConnectFriends: "您随时可以跳过此步骤，稍后再回来！",
    skipForNow: "跳过",
    logInWithEmail: "使用电子邮件登录",
    signUp: "注册",
    
    // Invitations
    noInvitations: "没有邀请。",
    startGameYourself: "你可以自己开始游戏！",
    gameInvitations: "游戏邀请",
    
    // Friends
    friend: "朋友",
    emptyFriendsList: "抱歉，目前还是空的...",
    inviteSomeone: "邀请某人。",
    refreshFriends: "刷新朋友",
    
    // Quiz Types
    playAlone: "独自游戏",
    playDuel: "决斗游戏",
    playGroup: "组队游戏",
    miniGames: "小游戏",
    
    // Category Screen
    yourTopic: "你的主题...",
    search: "搜索",
    orPickPreparedCategory: "或选择准备好的类别",
    
    // Difficulty Levels
    easyCubCurious: "简单：好奇小熊",
    mediumBearlyBrainy: "中等：聪明熊",
    hardGrizzlyGuru: "困难：灰熊大师",
    
    // Account Functions
    changePassword: "更改密码",
    logOut: "退出",
    deleteAccount: "删除账户",
    changing: "正在更改...",
    signingOut: "正在退出...",
    deleting: "正在删除...",
    currentPassword: "当前密码",
    newPassword: "新密码",
    repeatNewPassword: "重复新密码",
    changePasswordTitle: "更改密码",
    deleteAccountTitle: "删除账户",
    deleteAccountMessage: "您确定要删除您的账户吗？此操作无法撤销。",
    deleteConfirm: "删除",
    reLoginRequired: "需要重新登录",
    reLoginMessage: "出于安全原因，请重新登录以删除您的账户。",
    reLogin: "重新登录",
    passwordChanged: "您的密码已更改。",
    googleFacebookPassword: "您使用 Google 或 Facebook 登录。您无法更改密码。",
    
    // FAQ Questions and Answers
    faqHowDoesGameWork: "游戏如何运作？",
    faqHowDoesGameWorkAnswer: "每轮游戏包含10个问题，每个问题有30秒的回答时间。整轮游戏大约持续5分钟，外加每个问题开始计时前的短暂阅读时间。",
    faqGameModes: "有哪些游戏模式？",
    faqGameModesAnswer: "我们提供三种游戏类型：\n• 单人模式 - 独自游戏，回答后立即继续。\n• 决斗（1对1）- 与另一位用户进行4轮比赛，每轮10个问题。\n• 组队模式 - 每位玩家进行一轮10个问题。最多7-8名参与者。",
    faqTimingAndAnswering: "计时和答题如何运作？",
    faqTimingAndAnsweringAnswer: "首先，问题会显示几秒钟供阅读。然后出现答案选项。之后才开始30秒计时。在单人模式中，回答后立即继续。在多人模式中，所有人同时回答（同步游戏）。等待时间会显示可爱的熊加载动画。",
    faqPoints: "如何获得积分？",
    faqPointsAnswer: "根据问题难度和回答速度获得积分：\n\n正确答案：\n• 简单：5 QP\n• 中等：10 QP\n• 困难：15 QP\n\n时间奖励：\n• 5秒内回答：+5 QP\n• 10秒内回答：+3 QP\n• 20秒内回答：+1 QP\n\n完美回合奖励：\n• 10个问题全对：+50 QP",
    faqRewards: "有奖励吗？",
    faqRewardsAnswer: "是的！我们奖励表现：\n\n每周前三名：获得显示在个人资料的奖牌（铜牌、银牌、金牌）。每个奖牌都附带一个Quizzly Bear奖杯！\n\n高准确率（如前10%或20%）：在用户名旁边获得爪印图标。显示在所有游戏和排名中。如果下周低于阈值，爪印会消失。",
    faqStats: "我可以追踪我的统计数据吗？",
    faqStatsAnswer: "是的！您的个人资料显示：\n• 总积分\n• 准确率\n• 每周排名\n• 奖牌和奖励\n\n始终保持更新！",
    faqChallenges: "有特别挑战吗？",
    faqChallengesAnswer: "每周前10名玩家可能解锁一个超难测验作为个人挑战！这是我们目前正在测试的可选功能。",
    faqFriends: "如何添加朋友？",
    faqFriendsAnswer: "• 通过用户名或电子邮件地址搜索朋友。\n• 发送好友请求 - 对方必须接受。\n• 如果您的朋友还没有应用程序，您可以通过电子邮件发送邀请。",
  },
};

// Fallback to English if translation is missing
export const getTranslation = (key: keyof TranslationKeys, languageCode: string): string => {
  const languageTranslations = translations[languageCode];
  if (languageTranslations && languageTranslations[key]) {
    return languageTranslations[key];
  }
  
  // Fallback to English
  const englishTranslations = translations.en;
  if (englishTranslations && englishTranslations[key]) {
    return englishTranslations[key];
  }
  
  // Last resort fallback
  return key;
}; 