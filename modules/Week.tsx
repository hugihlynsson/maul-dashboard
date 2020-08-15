import Head from "next/head";
import styles from "../styles/Week.module.css";
import { StatelessComponent } from "react";
import Link from "next/link";

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
const getColorForName = (name: string): string =>
  hashColors[Math.abs(getStringHash(name) % hashColors.length)];

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

const formatDateForUrl = (date: Date): string =>
  date.toLocaleString("se", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

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

const Week: StatelessComponent<Props> = ({ week }) => {
  const fromDate = new Date(week[0].date);
  const toDate = new Date(week[4].date);
  const weekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
  const inOneWeek = new Date(fromDate.getTime() + weekInMilliseconds);
  const oneWeekAgo = new Date(fromDate.getTime() - weekInMilliseconds);

  return (
    <main className={styles.main}>
      <Head>
        <title>Maul Avo Reykjavík</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>Maul Avo Reykjavík</h1>
        <p className={styles.subtitle}>
          <Link href={`/${formatDateForUrl(oneWeekAgo)}`}>
            <a className={styles.button}>&larr;</a>
          </Link>{" "}
          {fromDate.getDate()}
          {fromDate.getMonth() !== toDate.getMonth() &&
            `.${fromDate.getMonth() + 1}`}
          {fromDate.getFullYear() !== toDate.getFullYear() &&
            `.${fromDate.getFullYear()}`}{" "}
          – {toDate.getDate()}.{toDate.getMonth() + 1}.{toDate.getFullYear()}{" "}
          <Link href={`/${formatDateForUrl(inOneWeek)}`}>
            <a className={styles.button}>&rarr;</a>
          </Link>
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

export default Week;
