🚀 Learning Engine

An AI-assisted learning platform built with Next.js, TypeScript, Prisma, PostgreSQL, Supabase Auth, and OpenAI.

Learning Engine demonstrates how to integrate AI into a full-stack application using deterministic backend logic, idempotent evaluation patterns, and cost-controlled API usage.

🎯 Overview

Learning Engine allows users to:

Create structured learning goals

Generate AI-created task plans (fixed 5 tasks)

Complete guided learning sessions

Receive AI evaluation summaries

Persist evaluation results safely and consistently

The system separates deterministic execution from AI orchestration to maintain reliability and architectural clarity.

🏗 Tech Stack

Frontend / Fullstack

Next.js (App Router)

Server Components + Server Actions

TypeScript

Tailwind CSS (dark theme)

Backend

PostgreSQL

Prisma ORM

Supabase Auth (browser + server clients)

AI Layer

OpenAI API

Structured JSON task generation

Structured JSON session evaluation

Persisted results to prevent duplicate calls

🧠 Architectural Highlights
Deterministic Session Engine

Task progression is derived entirely from persisted database state.
No client-side state machine is required.

AI at the Boundaries

AI is used only for:

Task plan generation

Final session evaluation

All execution logic remains server-controlled and predictable.

Idempotent Evaluation

Evaluation results are stored in the database to:

Prevent duplicate OpenAI calls

Prevent repeated billing on refresh

Guarantee consistent results across renders

Typed JSON Rehydration

AI responses are:

Parsed and validated

Cast to strict TypeScript types

Persisted as JSON

Safely rehydrated on subsequent requests

🔁 Core Flow

User logs in via Supabase Auth

User creates a learning goal

OpenAI generates a fixed-length (5 task) plan

Tasks are stored in a database transaction

User completes each task once

Session is marked complete

OpenAI evaluates the session

Evaluation is persisted and reused

🧩 What This Project Demonstrates

Full-stack TypeScript proficiency

Clean domain-driven layering

Server-first rendering patterns

Secure authentication integration

Structured AI orchestration

Cost-aware API design

Idempotent backend architecture

Production-minded thinking

🚧 Future Enhancements

Multi-attempt logic (up to 3 attempts per task)

Per-task AI grading

Adaptive difficulty system

Session history dashboard

RAG-based contextual knowledge

Scoring beyond simple pass/fail

🏁 Purpose

Learning Engine was built as a focused engineering exercise to strengthen backend architecture and AI integration skills in a production-style environment.

It prioritizes clarity, determinism, and disciplined system design over feature sprawl.
