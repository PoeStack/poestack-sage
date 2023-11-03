# How Docs Are Built

The docs are built and compiled to html using mdbook. The mdbook is hosted by github pages.

## Local dependencies
- install rust and cargo
  - [rustup](https://rustup.rs/)
- `cargo install mdbook`
- `cargo install mdbook-pagetoc`
- `cargo install mdbook-theme`

## Build

- Run `mdbook serve ./src/sage-docs`
- navigate to http://localhost:3000/ in a web browser

## References

- https://katopz.medium.com/how-to-build-mdbook-with-github-actions-eb9899e55d7e for actions setup
- https://rust-lang.github.io/mdBook/index.html
- https://github.com/slowsage/mdbook-pagetoc
