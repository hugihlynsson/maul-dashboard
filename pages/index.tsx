import Head from "next/head";
import styles from "../styles/Home.module.css";
import { GetStaticProps, NextPage } from "next";

const getStringHash = (str: string) =>
  Array.from(str).reduce((s, c) => (Math.imul(26, s) + c.charCodeAt(0)) | 0, 0);

const colors = {
  magenta: "#EC008C",
  blue: "#5D9CEC",
  purple: "#AC92EC",
  mintGreen: "#48CFAD",
  grassGreen: "#A0D468",
  orange: "#FFCE54",
  grapeError: "#ED5565",
};

const hashColors = Object.keys(colors).map((color) => colors[color]);
const getColorForName = (name: string): string => {
  const hash = getStringHash(name);
  const listIndex = Math.abs(hash % hashColors.length);
  const color = hashColors[listIndex];
  console.log("Generating hash for", name, ":", hash, listIndex, color);
  return color;
};

type CompanyDayOrder = {
  username: string;
  restaurant: string;
  dishName: string;
  dishDescription: string;
};

interface CompanyDayOrders {
  date: string; // Date string
  orders: Array<CompanyDayOrder>;
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Props {
  // companyName: string;
  week: [
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders
  ];
}

const Home: NextPage<Props> = ({ week }) => {
  const fromDate = new Date(week[0].date);
  const toDate = new Date(week[4].date);

  return (
    <main className={styles.main}>
      <Head>
        <title>Maul Avo Reykjavík</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>Maul Avo Reykjavík</h1>
        <p className={styles.subtitle}>
          {fromDate.getDate()}
          {fromDate.getMonth() !== toDate.getMonth() &&
            `.${fromDate.getMonth() + 1}`}
          {fromDate.getFullYear() !== toDate.getFullYear() &&
            `.${fromDate.getFullYear()}`}{" "}
          – {toDate.getDate()}.{toDate.getMonth() + 1}.{toDate.getFullYear()}
        </p>
      </header>

      <div className={styles.week}>
        {week.map(({ date, orders }) => (
          <section className={styles.day} key={date}>
            <header className={styles.dayHeader}>
              <h1 className={styles.dayName}>
                {weekDays[new Date(date).getDay() - 1]}
              </h1>
              <p className={styles.dayDate}>
                {new Date(date).getDate()}.{new Date(date).getMonth() + 1}
              </p>
              {new Date(date).toDateString() === new Date().toDateString() && (
                <p className={styles.dayToday}>Today</p>
              )}
            </header>

            {orders.map((order) => (
              <div key={order.username} className={styles.order}>
                <div
                  className={styles.user}
                  style={{ color: getColorForName(order.username) }}
                >
                  {order.username.split(" ")[0]}
                  <div
                    className={styles.userBackground}
                    style={{ backgroundColor: getColorForName(order.username) }}
                  />
                </div>
                <p className={styles.restaurant}>{order.restaurant}</p>
                <p className={styles.dishName}>{order.dishName}</p>
                <p className={styles.dishDescription}>
                  {order.dishDescription}.
                </p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
};

export default Home;

interface RawCompanyDayOrders {
  orders: Array<{
    menu_item_id: string;
    restaurant_id: string;
    username: string; // Full username "Hugi Hlynsson"
  }>;
  company: {
    id: string;
    name: string;
  };
  restaurants: {
    [restaurant_id: string]: {
      id: string;
      restaurant_name: string;
    };
  };
  menu_items: {
    [menu_item_id: string]: {
      id: string;
      short_description: string;
      description: string;
    };
  };
}

const formatCompanyDayOrders = (
  date: Date,
  day: RawCompanyDayOrders
): CompanyDayOrders => ({
  date: date.toJSON(),
  orders: day.orders.map((order) => ({
    username: order.username,
    restaurant: day.restaurants[order.restaurant_id].restaurant_name,
    dishName: day.menu_items[order.menu_item_id].short_description,
    dishDescription: day.menu_items[order.menu_item_id].description,
  })),
});

const getOrdersForDay = async (date: Date): Promise<CompanyDayOrders> => {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  let response = await fetch(
    `https://dev-api.maul.is/companies/avo/orders/${year}-${month}-${day}`
  );

  if (response.status === 404) {
    return { date: date.toJSON(), orders: [] };
  }

  const rawCompanyDayOrders: RawCompanyDayOrders = await response.json();

  return formatCompanyDayOrders(date, rawCompanyDayOrders);
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Get relevant monday (last monday unless weekend, then next)
  const dayInMilliSeconds = 1000 * 60 * 60 * 24;
  const now = new Date();
  const nowDay = now.getDay();
  const mondayOffsetFromToday = nowDay === 6 ? 2 : -nowDay + 1;
  const monday = new Date(
    now.getTime() + mondayOffsetFromToday * dayInMilliSeconds
  );

  const week = [
    monday,
    new Date(monday.getTime() + dayInMilliSeconds),
    new Date(monday.getTime() + dayInMilliSeconds * 2),
    new Date(monday.getTime() + dayInMilliSeconds * 3),
    new Date(monday.getTime() + dayInMilliSeconds * 4),
  ] as const;

  const weekOrders = await Promise.all(week.map((day) => getOrdersForDay(day)));

  return {
    props: {
      week: weekOrders as [
        CompanyDayOrders,
        CompanyDayOrders,
        CompanyDayOrders,
        CompanyDayOrders,
        CompanyDayOrders
      ],
    },
    revalidate: 1,
  };
};
