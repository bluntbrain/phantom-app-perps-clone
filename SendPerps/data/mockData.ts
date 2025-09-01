export interface PerpsData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  leverage: string;
  volume: string;
}

export const mockPerpsData: PerpsData[] = [
  {
    id: "1",
    rank: 1,
    symbol: "ETH-USD",
    name: "Ethereum",
    leverage: "25x",
    volume: "$2B",
  },
  {
    id: "2",
    rank: 2,
    symbol: "BTC-USD",
    name: "Bitcoin",
    leverage: "40x",
    volume: "$1.7B",
  },
  {
    id: "3",
    rank: 3,
    symbol: "SOL-USD",
    name: "Solana",
    leverage: "20x",
    volume: "$670M",
  },
  {
    id: "4",
    rank: 4,
    symbol: "HYPE-USD",
    name: "Hyperliquid",
    leverage: "10x",
    volume: "$227M",
  },
  {
    id: "5",
    rank: 5,
    symbol: "XRP-USD",
    name: "Ripple",
    leverage: "20x",
    volume: "$94M",
  },
  {
    id: "6",
    rank: 6,
    symbol: "IP-USD",
    name: "Internet Protocol",
    leverage: "3x",
    volume: "$68M",
  },
  {
    id: "7",
    rank: 7,
    symbol: "PUMP-USD",
    name: "Pump",
    leverage: "5x",
    volume: "$60M",
  },
  {
    id: "8",
    rank: 8,
    symbol: "DOGE-USD",
    name: "Dogecoin",
    leverage: "10x",
    volume: "$48M",
  },
];