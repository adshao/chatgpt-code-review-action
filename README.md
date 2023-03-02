# OpenAI ChatGPT Code Review

A GitHub Action that uses OpenAI ChatGPT to analyze code in pull request review comments.

## Usage

To use this action in your workflow, add the following step:

```yaml
name: OpenAI ChatGPT Code Review
uses: adshao/chatgpt-code-review-aciton@v1
with:
    LANGUAGE: 'English'
    PROGRAMMING_LANGUAGE: 'JavaScript'
    OPENAI_TOKEN: ${{ secrets.OPENAI_TOKEN }}
    REVIEW_PR_COMMENT: 'ai review please'
```

## Inputs

This action accepts the following inputs:

- `LANGUAGE` (optional): The response language of the OpenAI ChatGPT API. Default is "en".
- `PROGRAMMING_LANGUAGE` (optional): The programming language of the code in the GitHub repository. If not provided, the detected programming language will be used.
- `OPENAI_TOKEN` (required): The API token for the OpenAI ChatGPT API.
- `REVIEW_PR_COMMENT` (optional): The comment to trigger code review for the whole pull request.

## Outputs

This action does not produce any outputs.

## Example workflow

Here's an example workflow that uses this action to analyze code in pull request review comments:

```yaml
name: Code Review

on:
    pull_request_review:
        types: [submitted, edited]

jobs:
    code-review:
        runs-on: ubuntu-latest
        steps:
        - name: OpenAI ChatGPT Code Review
          uses: <username>/<repository>@<version>
          with:
            LANGUAGE: 'English'
            PROGRAMMING_LANGUAGE: 'JavaScript'
            OPENAI_TOKEN: ${{ secrets.OPENAI_TOKEN }}
            REVIEW_PR_COMMENT: 'ai review please'
```


This workflow runs the `OpenAI ChatGPT Code Review` action when a pull request review is submitted or edited. The action uses the `LANGUAGE`, `PROGRAMMING_LANGUAGE`, `REVIEW_PR_COMMENT` and `OPENAI_TOKEN` input values to analyze the code in the pull request review comment.

## License

The code in this repository is licensed under the MIT license. See `LICENSE` for more information.
