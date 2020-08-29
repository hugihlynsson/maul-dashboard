# Maul Weekly Dashboard

The [Maul Weekly Dashboard](https://maul.vercel.app) allows you to see your all of your companies weekly Maul orders in one screen. This is great to figure out who owns which meal when the orders arrive or to plan your orders for the week ahead. The dashboard works on mobile but really shines on 11" or larger screens.

## The Maul API 

Or: Why can I see what random people are having for lunch every day

When my previous employer started offering Maul to their employees I discovered that the API requests [their webapp](https://beta.maul.is) makes don't have any authentication. After digging through minified JS code on the page I reverse engineered their API, giving me access to a wide range of endpoints and UI routes, including some internal ones. The API exposes a huge amount of data, including all orders made since 2018, info on all companies that have used the product and, most severely, names and orders of employees—people that aren't aware that their personal data is in the open. The only thing that stops anyone from placing or cancelling orders on the behalf of other users is knowing their internal ID. Upon discovering this leak of private and personally identifyable data in fall 2019 I disclosed the issue to Maul who responded with plans to fix this before the end of this year. As of August 2020 the data is still as exposed.

## Running this project

This is a [Next.js](https://nextjs.org/) project and consists of two main routes. `/` lists all "active" Maul companies and `/<companyId>/<date>/` lists all orders from the relevant company from the week the date is in. Dates on saturdays and sundays fall back to the following week. `/<companyId>/` renders the same UI but defaults to the day today.

### Prerequisites:

- [NodeJS](https://nodejs.org/en/) 10.13 or later
- [Yarn](https://yarnpkg.com)

### Getting started

Run `yarn install` to get the dependencies. To start the development server run `yarn dev`. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Questions and answers

**Q: I don't want my personal data to be in the open, can you please remove my name?**

I could remove it from the dashboard but that wouldn't stop anyone else from getting this data and do whatever they want with it. To properly fix the issue, send a message to [maul@maul.is](mailto:maul@maul.is) and ask them to stop leaking personally identifyable data via an unauthenticated API.

**Q: Why are some orders in icelandic and others in english?**

This is due to a limitation in Maul's data structure for orders. When a users makes orders for a week, the description of the orders they make are sent to Maul in the current locale of the user. That info is then passed on with in the API for viewing all orders for a company for a given day.
