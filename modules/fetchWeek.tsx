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
    company_name: string;
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

const getOrdersForDay = async (companyId: string, date: Date) => {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  let response = await fetch(
    `https://dev-api.maul.is/companies/${companyId}/orders/${year}-${month}-${day}`
  );

  if (response.status === 404) {
    return { day: { date: date.toJSON(), orders: [] } };
  }

  const rawCompanyDayOrders: RawCompanyDayOrders = await response.json();

  return {
    day: formatCompanyDayOrders(date, rawCompanyDayOrders),
    company: {
      id: rawCompanyDayOrders.company.id,
      name: rawCompanyDayOrders.company.company_name,
    },
  };
};

interface WeekOrders {
  company: {
    id: string;
    name: string;
  };
  week: [
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders,
    CompanyDayOrders
  ];
}

export default async (companyId: string, date: Date): Promise<WeekOrders> => {
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

  const weekOrders = await Promise.all(
    week.map((day) => getOrdersForDay(companyId, day))
  );

  return {
    company: weekOrders.find(({ company }) => company)?.company ?? {
      id: companyId,
      name: companyId,
    },
    week: weekOrders.map(({ day }) => day) as [
      CompanyDayOrders,
      CompanyDayOrders,
      CompanyDayOrders,
      CompanyDayOrders,
      CompanyDayOrders
    ],
  };
};
