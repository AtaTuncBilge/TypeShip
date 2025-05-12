const textSamples = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "The best way to predict the future is to invent it.",
    "Simplicity is the ultimate sophistication.",
    "Good code is its own best documentation.",
    "Be yourself; everyone else is already taken.",
    "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    "In the middle of difficulty lies opportunity.",
    "Life is what happens when you're busy making other plans.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "I have not failed. I've just found 10,000 ways that won't work.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "You miss 100% of the shots you don't take.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall."
  ];
  
  export const getRandomText = () => {
    return textSamples[Math.floor(Math.random() * textSamples.length)];
  };