# LangChain Documentation Summary (Phase 0 Focus)

## Core Concepts

*   **LLMs / Chat Models:** Interface wrappers around large language models (e.g., OpenAI GPT-4, Anthropic Claude, Google Gemini). Chat models specifically use a message-based input/output (System, Human, AI messages).
    ```python
    # Example (requires pip install langchain-openai)
    from langchain_openai import ChatOpenAI
    chat = ChatOpenAI(model="gpt-4o", temperature=0)
    # response = chat.invoke("Translate 'hello' to French")
    ```
*   **Prompt Templates:** Manage and format prompts sent to LLMs. Handle input variables and structure output.
    ```python
    from langchain_core.prompts import ChatPromptTemplate
    template = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant."),
        ("human", "Translate this text: {text}")
    ])
    # formatted_prompt = template.invoke({"text": "Hello"})
    ```
*   **Output Parsers:** Structure the LLM's response (which is usually text) into more usable formats (e.g., JSON, lists, custom objects).
    ```python
    from langchain_core.output_parsers import StrOutputParser
    parser = StrOutputParser()
    # result = parser.invoke(llm_response)
    ```
*   **Chains (LCEL - LangChain Expression Language):** The primary way to combine components (prompts, models, parsers, tools, etc.) into sequences. Uses a pipe (`|`) syntax.
    ```python
    chain = template | chat | parser
    # result = chain.invoke({"text": "Hello"})
    ```
*   **Retrieval-Augmented Generation (RAG):** Augment LLM knowledge with external data. Involves:
    *   **Document Loaders:** Load data from sources (files, web, databases).
    *   **Text Splitters:** Break large documents into smaller chunks.
    *   **Embeddings:** Convert text chunks into numerical vectors.
    *   **Vector Stores:** Store and efficiently search embedding vectors (e.g., Chroma, FAISS, Pinecone).
    *   **Retrievers:** Fetch relevant chunks from the vector store based on a query.
    ```python
    # Simplified RAG Chain Example
    # retriever = vector_store.as_retriever()
    # rag_chain = (
    #     {"context": retriever | format_docs, "question": RunnablePassthrough()}
    #     | prompt_template
    #     | llm
    #     | StrOutputParser()
    # )
    # result = rag_chain.invoke("What is LangChain?")
    ```
*   **Agents:** LLMs that use **Tools** to interact with the outside world. An agent decides *which* tools to use and in *what order* based on user input. LangChain provides built-in agent types (e.g., ReAct, OpenAI Functions) and frameworks for creating custom agents.
    *   **Tools:** Functions that agents can call (e.g., web search, database query, calculator, custom Python functions). Defined using `@tool` decorator or `Tool` class.
    *   **Agent Executor:** Runs the agent loop (LLM call -> decide tool -> execute tool -> process result -> repeat).
    ```python
    # Example using create_openai_tools_agent
    # from langchain.agents import AgentExecutor, create_openai_tools_agent
    # tools = [your_tool_1, your_tool_2]
    # agent = create_openai_tools_agent(llm, tools, prompt)
    # agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    # result = agent_executor.invoke({"input": "What's the weather in SF?"})
    ```
*   **Memory:** Add state to chains or agents, allowing them to remember past interactions. Various memory types exist (e.g., `ConversationBufferMemory`).

## LangGraph Integration

*   LangChain components (LLMs, Tools, Prompts, Parsers) are used *within* LangGraph nodes and edges to define the logic of stateful, multi-step agentic workflows. LangGraph provides the structure (graph, state, nodes, edges) for orchestrating these components.

## Key Concepts & Links

*   **LCEL (LangChain Expression Language):** The declarative way to build chains using the `|` operator. Fundamental to modern LangChain.
*   **Integrations:** LangChain provides numerous integrations for LLMs (`langchain-openai`, `langchain-google-genai`, etc.), vector stores, document loaders, etc., often in separate packages (`langchain-community`).
*   **Official Docs & Resources:**
    *   [LangChain Python Documentation](https://python.langchain.com/)
    *   [LCEL Cookbook](https://python.langchain.com/v0.2/docs/concepts/#langchain-expression-language-lcel)
    *   [Agents Overview](https://python.langchain.com/v0.2/docs/concepts/#agents)
    *   [RAG Overview](https://python.langchain.com/v0.2/docs/concepts/#retrieval-augmented-generation-rag)
    *   [Available Integrations](https://python.langchain.com/v0.2/docs/integrations/)