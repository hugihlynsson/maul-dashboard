import { GetServerSideProps, NextPage } from "next";
import fetchWeek from "../../modules/fetchWeek";
import Week from "../../modules/Week";

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
  company: {
    name: string;
    id: string;
  };
  week: [
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders
  ];
}

const Company: NextPage<Props> = ({ company, week }) => (
  <Week company={company} week={week} />
);
export default Company;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => ({
  props: await fetchWeek(context.params.companyId as string, new Date()),
});
