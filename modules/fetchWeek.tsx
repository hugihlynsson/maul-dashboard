
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

export default async (date: Date) => {
  const dayInMilliSeconds = 1000 * 60 * 60 * 24;
  const dateDay = date.getDay();
  const mondayOffsetFromToday = dateDay === 6 ? 2 : -dateDay + 1;
  const monday = new Date(
    date.getTime() + mondayOffsetFromToday * dayInMilliSeconds
  );

  const week = [
    monday,
    new Date(monday.getTime() + dayInMilliSeconds),
    new Date(monday.getTime() + dayInMilliSeconds * 2),
    new Date(monday.getTime() + dayInMilliSeconds * 3),
    new Date(monday.getTime() + dayInMilliSeconds * 4),
  ] as const;

  const weekOrders = await Promise.all(week.map((day) => getOrdersForDay(day)));

  return  weekOrders as [
        CompanyDayOrders,
        CompanyDayOrders,
        CompanyDayOrders,
        CompanyDayOrders,
        CompanyDayOrders
      ];
};
