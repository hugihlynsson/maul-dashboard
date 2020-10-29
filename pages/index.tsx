import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Link from "next/link";

interface Props {
  companies: Array<{
    CompanyId: string;
    Domains: string[];
    Status: "Inactive" | "Active";
    Accounts?: [
      {
        AccountId: string;
        AccontName: string;
      }
    ];
    Name: string;
  }>;
}

const Home: NextPage<Props> = ({ companies }) => {
  return (
    <main className={styles.main}>
      <Head>
        <title>Maul Weekly Dashboard</title>
      </Head>

      <h1 className={styles.title}>Maul Weekly Dashboard</h1>
      <p className={styles.subtitle}>
        Select your company to get started &darr;
      </p>

      <div className={styles.companies}>
        {companies
          .filter(({ Status }) => Status === "Active")
          .map(({ CompanyId, Name, Domains }) => (
            <Link key={CompanyId} href={`/${CompanyId}`}>
              <a className={styles.company}>
                <p className={styles.companyName}>{Name}</p>
                <p className={styles.companyDomain}>{Domains[0]}</p>
              </a>
            </Link>
          ))}
      </div>
    </main>
  );
};
export default Home;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const response = await fetch("https://dev-api.maul.is/companies");
  return {
    props: {
      companies: await response.json(),
    },
  };
};
