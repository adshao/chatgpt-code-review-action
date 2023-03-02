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
    GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
    FULL_REVIEW_COMMENT: 'chatgpt'
    REVIEW_COMMENT_PREFIX: 'chatgpt:'
```

## Inputs

This action accepts the following inputs:

- `LANGUAGE` (optional): The response language of the OpenAI ChatGPT API. Default is "en".
- `PROGRAMMING_LANGUAGE` (optional): The programming language of the code in the GitHub repository. If not provided, the detected programming language will be used.
- `OPENAI_TOKEN` (required): The API token for the OpenAI ChatGPT API.
- `GITHUB_TOKEN` (required): The API token for the Github API.
- `FULL_REVIEW_COMMENT` (required): The comment to trigger code review for the pull request.
- `REVIEW_COMMENT_PREFIX` (required): The comment prefix to trigger code review with the comment content.

## Outputs

This action does not produce any outputs.

## Example workflow

Here's an example workflow that uses this action to analyze code in pull request review comments:

```yaml
name: Code Review

on:
  issue_comment:
    types: [created, edited]

jobs:
  code-review:
    runs-on: ubuntu-latest
    if: |
      github.event.comment.user.login == 'adshao' &&
      github.event.comment.body.startsWith('chatgpt:')
    steps:
    - name: OpenAI ChatGPT Code Review
      uses: adshao/chatgpt-code-review-action@v1
      with:
        LANGUAGE: 'English'
        PROGRAMMING_LANGUAGE: 'JavaScript'
        OPENAI_TOKEN: ${{ secrets.OPENAI_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
        FULL_REVIEW_COMMENT: 'chatgpt'
        REVIEW_COMMENT_PREFIX: 'chatgpt:'
```

This workflow runs the `OpenAI ChatGPT Code Review` action when a pull request comment is created or edited. The action uses the `LANGUAGE`, `PROGRAMMING_LANGUAGE`, `FULL_REVIEW_COMMENT`, `REVIEW_COMMENT_PREFIX`, `OPENAI_TOKEN` and `GITHUB_TOKEN` input values to analyze the code in the pull request comment.

* If the comment starts with `chatgpt:` and is sent by `adshao`, the workflow will be triggered.

* If the comment is exactly `chatgpt`, it will trigger a code review for the diff of the pull request.

## License

The code in this repository is licensed under the MIT license. See `LICENSE` for more information.
