import Head from "next/head";
import styles from "../styles/Home.module.css";
import { GetStaticProps, NextPage } from "next";

interface CompanyDayOrders {
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

interface Props {
  from: string; // Date string
  to: string; // Date string
  weekOrders: [
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders
  ];
}

const Home: NextPage<Props> = ({ from, to, weekOrders }) => {
  console.log("Got orders", weekOrders);

  return (
    <main className={styles.main}>
      <Head>
        <title>Maul Avo Reykjavík</title>
      </Head>

      <h1 className={styles.title}>Maul Avo Reykjavík</h1>
      <p className={styles.subtitle}>
        {new Date(from).toLocaleDateString("de-DE")} –{" "}
        {new Date(to).toLocaleDateString("de-DE")}
      </p>

      <div className={styles.week}>
        {weekOrders.map((day, index) => (
          <section className={styles.day} key={index}>
            <h1 className={styles.dayName}>
              {["Monday", "Thursday", "Wednesday", "Thursday", "Friday"][index]}
            </h1>

            {day.orders.map((order, index) => (
              <div key={index} className={styles.order}>
                <p className={styles.user}>{order.username}</p>
                <p className={styles.restaurant}>
                  {day.restaurants[order.restaurant_id].restaurant_name}
                </p>
                <p className={styles.dishName}>
                  {day.menu_items[order.menu_item_id].short_description}
                </p>
                <p className={styles.dishDescription}>
                  {day.menu_items[order.menu_item_id].description}
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

const getOrdersForDay = async (date: Date): Promise<CompanyDayOrders> => {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  let response = await fetch(
    `https://dev-api.maul.is/companies/avo/orders/${year}-${month}-${day}`
  );

  if (response.status === 404) {
    return {
      orders: [],
      company: { id: "unknown", name: "Unknown" },
      restaurants: {},
      menu_items: {},
    };
  }

  return response.json();
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
      from: monday.toJSON(),
      to: week[4].toJSON(),
      weekOrders: weekOrders as [
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
