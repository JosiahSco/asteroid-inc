export const achievementList = [
    {
        id: 0,
        name: 'Click 100 Times',
        description: 'Only a million more to go',
        condition: (state) => state.clicks >= 100,
    },
    {
        id: 1,
        name: 'Click 1,000 Times',
        description: "You're really taking this seriously",
        condition: (state) => state.clicks >= 1000,
    },
    {
        id: 2,
        name: 'Click 1M Times',
        description: "This one shouldn't even be possible!",
        condition: (state) => state.clicks >= 1_000_000,
    },
    {
        id: 3,
        name: '6 Figures!',
        description: 'Living the American dream',
        condition: (state) => state.money >= 100_000,
    },
    {
        id: 4,
        name: 'Millionaire!',
        description: 'Welcome to the 1%',
        condition: (state) => state.money >= 1_000_000,
    },
    {
        id: 5,
        name: 'Now What?',
        description: "You bought everything",
        condition: (state) => state.purchasedUpgrades.includes(6),
    }
]