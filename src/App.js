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

const GET_ISSUES_OF_REPO = `
    query($organization: String!, $repository: String!)
    {
        organization(login: $organization) {
        name
        url
        repository(name: $repository) {
            name
            url
            issues(last: 5, states: [OPEN]) {
                edges {
                    node {
                        id
                        title
                        url
                        reactions(last: 3) {
                            edges {
                                node {
                                    id
                                    content
                                }
                            }
                            totalCount
                            pageInfo {
                                endCursor
                                hasNextPage
                            }
                        }
                    }
                }
            }
        }
        }
    }`;

const Organization = ({ organization, errors, onFetchMoreIssues }) => {
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
            <Repository repository={organization.repository} onFetchMoreIssues={onFetchMoreIssues}/>
        </div>
    );
};
const Repository = ({ repository, onFetchMoreIssues }) => (
    <div>
        <p>
            <strong>In repository: </strong>
            <a href={repository.url}>{repository.name}</a>
        </p>
        <ul>
            {repository.issues.edges.map(issue => (
                <li key={issue.node.id}>
                    <a href={issue.node.url}>{issue.node.title}</a>
                    <ul>
                        {issue.node.reactions.edges.map(reaction => (
                            <li key={reaction.node.id}>{reaction.node.content}</li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>
        <hr />
        <button onClick={onFetchMoreIssues}>More</button>
    </div>

);
const getIssuesOfRepoQuery = (path, cursor) => {
    const [organization, repository] = path.split('/');

    return axiosGitHubGraphQL.post('', {
        query: GET_ISSUES_OF_REPO,
        variables: { organization, repository, cursor, }
    })
}

const resolveIssuesOfRepoQuery = queryResult => () => ({
    oraganization: queryResult.data.data.organization,
    errors: queryResult.data.errors,
})
/* Composite function --> resolve(queryResult) { return (() => ({...})) } */

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
    onSubmit = event => {
        this.onFetchFromGithub(this.state.path);
        event.preventDefault();
    };
    onChange = event => {
        this.setState({ path: event.target.value });
    };
    onFetchFromGithub = (path111, cursor) => {

    /* EXTRACTED OUT INTO HIGHER-ORDERED FUNCTONS --> getIssuesOfRepoQuery() and resolveIssuesOfRepoQuery() */
        // const [organization, repository] = path.split('/');
        // return axiosGitHubGraphQL.post('', {
        //     query: GET_ISSUES_OF_REPO,
        //     variables: { organization, repository, cursor, }
        //     }).then(result => {
        //         console.log(result);
        //         this.setState(() => ({
        //             organization: result.data.data.organization,
        //             errors: result.data.errors,
        //         }));
        //     });
        getIssuesOfRepoQuery(path, cursor).then(queryResult => 
            this.setState(resolveIssuesOfRepoQuery(queryResult, cursor))
        );
    };

    onFetchMoreIssues = () => {
        const {endCursor,} = this.state.organization.repository.issues.pageInfo;
        this.onFetchFromGithub(this.state.path, endCursor)
    }

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
                    <Organization organization={organization} errors={errors} onfetchMoreIssues={this.onFetchMoreIssues} />
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
