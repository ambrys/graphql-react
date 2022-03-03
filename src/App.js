import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
const TITLE = 'React GraphQL Github Client';
const axiosGitHubGraphQL = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
        Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
    },
});

const GET_ISSUES_OF_REPO_QUERY = `
  {
    organization(login: "${organization}") {
      name
      url
      repository(name: "${repository}") {
        name
        url
        issues(last: 5) {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }`;

const Organization = ({ organization, errors }) => {
    if (errors) {
        return (
            <p>
                <strong>Something went wrong: </strong>
                {errors.map((error) => error.message).join(' ')}
            </p>
        );
    }

    return (
        <div>
            <p>
                <strong>Issues from Organization: </strong>
                <a href={organization.url}>{organization.name}</a>
            </p>
            <Repository repository={organization.repository} />
        </div>
    );
};
const Repository = ({ repository }) => (
    <div>
        <p>
            <strong>In repository: </strong>
            <a href={repository.url}>{repository.name}</a>
        </p>
        <ul>
            {repository.issues.edges.map((issue) => (
                <li key={issue.node.id}>
                    <a href={issue.node.url}>{issue.node.title}</a>
                </li>
            ))}
        </ul>
    </div>
);

class App extends Component {
    state = {
        path: 'the-road-to-learn-react/the-road-to-learn-react',
        organization: null,
        errors: null,
    };

    componentDidMount() {
        // console.log(`${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`);
        this.onFetchFromGithub(this.state.path);
    }
    onSubmit = (event) => {
        this.onFetchFromGithub(this.state.path);
        event.preventDefault();
    };
    onChange = (event) => {
        this.setState({ path: event.target.value });
    };
    onFetchFromGithub = () => {
        axiosGitHubGraphQL
            .post('', { query: GET_ISSUES_OF_REPO_QUERY })
            .then((result) => {
                console.log(result);
                this.setState(() => ({
                    organization: result.data.data.organization,
                    errors: result.data.errors,
                }));
            });
        // axiosGitHubGraphQL
        //     .post('', { query: GET_ORG })
        //     .then((result) => console.log(result));
    };

    render() {
        const { path, organization, errors } = this.state;
        return (
            <div>
                <h1>{TITLE}</h1>
                <form onSubmit={this.onSubmit}>
                    <label htmlFor="url">
                        Show open issues for https://github.com
                    </label>
                    <br /> <br />
                    <input
                        id="url"
                        type="text"
                        value={path}
                        onChange={this.onChange}
                        style={{ width: '300px' }}
                    />
                    <br /> <br />
                    <button type="submit">Search</button>
                </form>
                <hr />
                {organization ? (
                    <Organization organization={organization} errors={errors} />
                ) : (
                    <p>No information yet...</p>
                )}
            </div>
        );
    }
}
export default App;

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
