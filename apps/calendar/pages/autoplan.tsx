import Head from "next/head";
import { Fragment } from "react";

const title = "Autoplan";

const AutoplanPage = () => (
  <Fragment>
    <Head>
      <title>{title}</title>
      <meta name="description" content={title} />
    </Head>

    <main>
      <h1>{title}</h1>
    </main>
  </Fragment>
);

export default AutoplanPage;
