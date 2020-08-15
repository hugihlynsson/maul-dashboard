import { GetServerSideProps, NextPage } from "next";
import fetchWeek from "../modules/fetchWeek";
import Week from "../modules/Week";

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

const Home: NextPage<Props> = ({ week }) => <Week week={week} />;
export default Home;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => ({
  props: {
    week: await fetchWeek(new Date(context.params.date as string | undefined)),
  },
});
