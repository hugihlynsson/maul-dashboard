import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Link from "next/link";

interface Props {
  companies: Array<{
    CompanyId: string;
    Domain: string;
    Active: boolean;
    Name: string;
  }>;
}

const Home: NextPage<Props> = ({ companies }) => {
  return (
    <main className={styles.main}>
      <Head>
        <title>Maul Companies</title>
      </Head>

      <h1 className={styles.title}>Maul Companies</h1>

      <div className={styles.companies}>
        {companies
          .filter(({ Active }) => Active)
          .map(({ CompanyId, Name, Domain }) => (
            <Link href={`/${CompanyId}`}>
              <a className={styles.company} key={CompanyId}>
                <p className={styles.companyName}>{Name}</p>
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
