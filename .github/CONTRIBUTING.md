# Contributing

Thanks for your time and interest in contributing to the Byte Invoice project. As a contributor, here are the guidelines we would like you to follow:

* [Contributing Code](#contributing-code)
* [Creating an Issue](#creating-an-issue)
* [Pull Requests](#pull-requests)
* [Git Workflow](#git-workflow)
* [Commit Message Guidelines](#commit-message-guidelines)

## Contributing Code

* By contributing to this project, you share your code under the GPLv3 license, as specified in the [License](/LICENSE) file.
* Please ensure your changes align with the existing code style and pass the linter (`npm run lint`).

## Creating an Issue

* If you want to report a security problem **DO NOT CREATE AN ISSUE**, please read our [Security Policy](.github/SECURITY.md) on how to submit a security vulnerability.
* When creating a new issue, please provide a clear description of the problem or feature request.
* Include steps to reproduce the issue when reporting bugs.

## Pull Requests

Good pull requests—patches, improvements, new features—are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please ask first before embarking on any significant pull request (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the maintainers might not want to merge into the project.

Follow these steps when submitting a pull request:

1. Go over the [Installation Guide](/README.md#installation-guide) in the README
2. Follow our [Git Workflow](#git-workflow)
3. Update the README with details of changes if applicable
4. Ensure `npm run lint` passes

## Git Workflow

This project uses the [Git Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).

### Branch naming guidelines

Branches follow this structure:

```
<type>/<short-summary-or-description>
```

Where `type` can be `feature`, `bugfix`, `hotfix`, `docs`, or `chore`.

### Branches

* `main` — The production branch. Clone or fork this repository for the latest copy.
* Feature branches — Create a branch from `main` for your work. Pull requests should target `main`.

## Commit Message Guidelines

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/). A commit message consists of a **header**, optional **body**, and optional **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory. The **scope** is optional.

### Type

Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **build**: Changes that affect the build system
* **ci**: Changes to CI configuration files
* **chore**: Changes to the build process or auxiliary tools
