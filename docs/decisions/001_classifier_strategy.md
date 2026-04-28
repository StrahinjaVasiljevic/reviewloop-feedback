# 001 - Classifier Strategy

Date: 2026-04-01

## Decision

Use rules-based classification for initial feedback routing.

## Status

Accepted

## Context

Machine learning models require significant annotated datasets to train. At this early stage, investing in ML would delay shippable value and add indeterminate latency.

## Consequences

Using keyword-based matching allows us to get immediate feedback routing while building labeled data organically for a future ML model transition.

## Alternatives Considered

ML classifier trained on public sentiment datasets — rejected due to lack of specificity and high implementation cost for uncertain value.
