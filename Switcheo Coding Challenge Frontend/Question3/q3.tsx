//The first two interfaces is very alike, it is just that the second one has the formatted amount, which is not something that needs to be made with another interface. Additionally, the wallet needs to check its type of blockchain, but the attributet is never there.

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; 
}

class Datasource {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<Record<string, number>> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`);
      }

      const data: { currency: string; price: number }[] = await response.json();
      const prices: Record<string, number> = {};
      data.forEach((item) => (prices[item.currency] = item.price));

      return prices;
    } catch (error) {
      console.error("Error fetching prices:", error);
      return {};
    }
  }
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const [prices, setPrices] = useState<Record<string, number>>({});

  //The initial useEffect incorrectly handle the async funtion cause it cannot return a promise becuase it return either undefined, or a clean up function. Additionally, the initial function does not properly handle the errors. 

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const datasource = new Datasource("https://interview.switcheo.com/prices.json");
        const fetchedPrices = await datasource.getPrices();
        setPrices(fetchedPrices);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };

    fetchPrices();
  }, []);

  //The blockchain parameter in this function is given "any" type, which I think will not be necessary as the blockchain type will always be a string in this question.
  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  //So, useMemo is a react hook that memoizes the the result of a function call whenever the dependencies change. There are some logical errors with the sorting : 
  // 1. To sort out wallets with a blockchain and non-zero balance, the function given in the question only sorts out wallets with valid blockchain, but does not eliminate the non-zero balance wallets.
  //2. There is if(lhsPriority > -99) that suddenly appaers out of nowhere, the lhsPriority is never defined, will throw an error. 
  //3. The sorting function is redundant, can be simplified in the given code. 
  //4. The balance shall be sorted everytime the balance changes, but if the balance does not change and the price changes, the sorting process shall not be done. Hence, we can get rid of the [prices] as the dependency of the useMemo().
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
  }, [balances]);

  //Instead of formatting the balance of each wallet, what we do here is to apply the .toFixed() directly on the rows. 
  const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = (prices[balance.currency] || 0) * balance.amount; //This one prevents that a NaN value in the price data that causes the program to go wrong.
    return (
      <WalletRow
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed(2)}
      />
    );
  });

  return <div {...rest}>
      {rows}
    </div>;
};

export default WalletPage;
