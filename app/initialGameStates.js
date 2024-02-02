export const initialUpgradeState = [
    { id: 1, name: 'Human Miner', cost: 15, perSecond: 0.1, qty: 0, img: '/human.png', sound: '/sounds/human-sound.mp3'},
    { id: 2, name: 'Alien Miner', cost: 100, perSecond: 1, qty: 0, img: '/alien.png', sound: '/sounds/alien-sound.mp3'},
    { id: 3, name: 'Space Beast', cost: 1000, perSecond: 10, qty: 0, img: '/space-beast.png', sound: '/sounds/space-beast-sound.mp3'},
    { id: 4, name: 'Nano bot', cost: 7500, perSecond: 75, qty: 0, img: '/nanobot.png', sound: '/sounds/nano-bot-sound.mp3'},
    { id: 5, name: 'Mech Miner', cost: 25_000, perSecond: 200, qty: 0, img: '/mech-miner.png', sound: '/sounds/mech-miner-sound.mp3'},
    { id: 6, name: 'Giant Lazer', cost: 100_000, perSecond: 500, qty: 0, img: '/giant-lazer.png', sound: '/sounds/giant-lazer-sound.mp3'},
];

export const initState = {
    money: 0,
    clickUpgrade: {
      moneyPerClick: 1,
      cost: 10
    },
    moneyPerSecond: 0,
    purchasedUpgrades: [],
    upgrades: initialUpgradeState,
    muted: true,
    prestige: 0,
    prestigeMultiplier: 1,
    collectedAchievements: [],
    clicks: 0,
    allTimeMoney: 0,
  }