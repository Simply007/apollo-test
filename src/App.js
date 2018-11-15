import React, { Component } from 'react';
import './App.css';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { RestLink } from 'apollo-link-rest';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ResponseMapper, getParserAdapter } from 'kentico-cloud-delivery';



const restLink = new RestLink({
  uri: 'https://deliver.kenticocloud.com/975bf280-fd91-488c-994c-2f04416e5ee3/'

});

const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache(),
});

const mapContentItems = (deliveryConfig, items, modular_content, pagination) => {
  const responseMapService = new ResponseMapper(deliveryConfig, getParserAdapter());
  const data = {
    data: {
      items,
      modular_content,
      pagination
    }
  };
  return responseMapService
    .mapMultipleResponse(data, deliveryConfig);
}

class Articles extends Component {
  render() {
    const { data: { loading, error, articles } } = this.props;
    let typedItems;
    if (!loading) {
      typedItems = mapContentItems({ projectId: "975bf280-fd91-488c-994c-2f04416e5ee3", typeResolvers: [] },
        articles.items,
        articles.modular_content,
        articles.pagination)
        .items;
    }
    if (loading) {
      return <h4>Loading...</h4>;
    }
    if (error) {
      return <h4>{error.message}</h4>;
    }
    console.log(typedItems[5])
    return (
      typedItems.map((item, index) =>
        <div key={item.system.id}>
          <div className="row">
            <div className="col-xs-12">
              <h4>{item.title.value}</h4>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <img alt={item.teaser_image.assets[0].description}
                className="img-responsive" src={item.teaser_image.assets[0].url}
                title={item.teaser_image.assets[0].description} />
            </div>
            <div className="col-sm-8">
              {item.summary.value}
              <p>
                <a className="btn btn-sm btn-primary" href="#" role="button">Read more</a>
              </p>
            </div>
          </div>
        </div>));
  }
}

const Query = gql`
  query($itemType: String!) {
          articles(search: $itemType)
      @rest(type: "Items", path: "items?system.type=:search") {
          items
      modular_content
        pagination
      }
    }
  `;

const ArticlesWithData = graphql(Query, {
  options: ({ itemType }) => {
    return { variables: { itemType } };
  },
})(Articles);


class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="container">
          <div className="header clearfix">
            <nav>
              <ul className="nav nav-pills pull-right">
                <li role="presentation" className="active"><a href="/">Home</a></li>
                <li role="presentation"><a rel="noopener noreferrer" href="https://kenticocloud.com/" target="_blank">Kentico Cloud</a></li>
                <li role="presentation"><a rel="noopener noreferrer" href="https://app.kenticocloud.com/sign-up" target="_blank">Sign up</a></li>
              </ul>
            </nav>
            <h3 className="text-muted">Kentico Cloud Boilerplate</h3>
          </div>

          <div className="jumbotron">
            <h1>Let's Get Started</h1>
            <p className="lead">This boilerplate includes a set of features and best practices to kick off your website development with Kentico Cloud smoothly. Take a look into the code to see how it works.</p>
            <p><a className="btn btn-lg btn-success" rel="noopener noreferrer" href="." role="button">Read the Quick Start</a></p>
          </div>

          <div className="row marketing">
            <h2>Articles from the Dancing Goat Sample Site</h2>
          </div>
          <div className="row marketing">
            <ArticlesWithData itemType="article" />
          </div>
          <footer className="footer">
            <p>© 2017 Company, Inc.</p>
          </footer>

        </div>
      </ApolloProvider>
    );
  }
}

export default App;
