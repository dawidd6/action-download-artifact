FROM ruby:2.6-alpine

COPY *.rb /

ENTRYPOINT ["/main.rb"]
