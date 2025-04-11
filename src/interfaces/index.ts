export interface IToken {
  id: string,
  attributes: {
    address: `0x${string}`,
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: string,
    logoUrl: string,
  },
};

export interface Config {
  OPENAI_API_KEY?: string;
  PRIORITY_LEVEL?: "medium" | "high" | "veryHigh"; // medium, high, or veryHigh
  PERPLEXITY_API_KEY?: string;
}