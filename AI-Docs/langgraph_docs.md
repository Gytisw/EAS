# LangGraph Documentation: Core Concepts, Graph Building, State Management, Agent Creation

## Defining State Graph for Self-Discover Agent
DESCRIPTION: Constructs the state graph for the Self-Discover agent, defining the state structure, node functions, and graph edges using LangGraph.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/tutorials/self-discover/self-discover.ipynb#2025-04-22_snippet_3
LANGUAGE: python
```python
from typing import Optional
from typing_extensions import TypedDict

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from langgraph.graph import END, START, StateGraph


class SelfDiscoverState(TypedDict):
    reasoning_modules: str
    task_description: str
    selected_modules: Optional[str]
    adapted_modules: Optional[str]
    reasoning_structure: Optional[str]
    answer: Optional[str]


model = ChatOpenAI(temperature=0, model="gpt-4-turbo-preview")


def select(inputs):
    select_chain = select_prompt | model | StrOutputParser()
    return {"selected_modules": select_chain.invoke(inputs)}


def adapt(inputs):
    adapt_chain = adapt_prompt | model | StrOutputParser()
    return {"adapted_modules": adapt_chain.invoke(inputs)}


def structure(inputs):
    structure_chain = structured_prompt | model | StrOutputParser()
    return {"reasoning_structure": structure_chain.invoke(inputs)}


def reason(inputs):
    reasoning_chain = reasoning_prompt | model | StrOutputParser()
    return {"answer": reasoning_chain.invoke(inputs)}


graph = StateGraph(SelfDiscoverState)
graph.add_node(select)
graph.add_node(adapt)
graph.add_node(structure)
graph.add_node(reason)
graph.add_edge(START, "select")
graph.add_edge("select", "adapt")
graph.add_edge("adapt", "structure")
graph.add_edge("structure", "reason")
graph.add_edge("reason", END)
app = graph.compile()
```

---

## Implementing Graph-based Tool Selection System
DESCRIPTION: Defines and implements a state graph system that handles tool selection and agent interaction based on user queries.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/how-tos/many-tools.ipynb#2025-04-22_snippet_4
LANGUAGE: python
```python
from typing import Annotated

from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition


class State(TypedDict):
    messages: Annotated[list, add_messages]
    selected_tools: list[str]


builder = StateGraph(State)

tools = list(tool_registry.values())
llm = ChatOpenAI()


def agent(state: State):
    selected_tools = [tool_registry[id] for id in state["selected_tools"]]
    llm_with_tools = llm.bind_tools(selected_tools)
    return {"messages": [llm_with_tools.invoke(state["messages"])]}


def select_tools(state: State):
    last_user_message = state["messages"][-1]
    query = last_user_message.content
    tool_documents = vector_store.similarity_search(query)
    return {"selected_tools": [document.id for document in tool_documents]}


builder.add_node("agent", agent)
builder.add_node("select_tools", select_tools)

tool_node = ToolNode(tools=tools)
builder.add_node("tools", tool_node)

builder.add_conditional_edges("agent", tools_condition, path_map=["tools", "__end__"])
builder.add_edge("tools", "agent")
builder.add_edge("select_tools", "agent")
builder.add_edge(START, "select_tools")
graph = builder.compile()
```

---

## Defining ReAct Agents and State Graph for Travel Recommendations in Python
DESCRIPTION: This snippet creates two ReAct agents (travel advisor and hotel advisor) with their respective tools and prompts. It then defines functions to call these agents and sets up a state graph to manage the flow between agents.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/how-tos/multi-agent-network.ipynb#2025-04-22_snippet_8
LANGUAGE: python
```python
from langgraph.graph import MessagesState, StateGraph, START, END
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command


model = ChatAnthropic(model="claude-3-5-sonnet-latest")

# Define travel advisor ReAct agent
travel_advisor_tools = [
    get_travel_recommendations,
    make_handoff_tool(agent_name="hotel_advisor"),
]
travel_advisor = create_react_agent(
    model,
    travel_advisor_tools,
    prompt=(
        "You are a general travel expert that can recommend travel destinations (e.g. countries, cities, etc). "
        "If you need hotel recommendations, ask 'hotel_advisor' for help. "
        "You MUST include human-readable response before transferring to another agent."
    ),
)


def call_travel_advisor(
    state: MessagesState,
) -> Command[Literal["hotel_advisor", "__end__"]]:
    # You can also add additional logic like changing the input to the agent / output from the agent, etc.
    # NOTE: we're invoking the ReAct agent with the full history of messages in the state
    return travel_advisor.invoke(state)


# Define hotel advisor ReAct agent
hotel_advisor_tools = [
    get_hotel_recommendations,
    make_handoff_tool(agent_name="travel_advisor"),
]
hotel_advisor = create_react_agent(
    model,
    hotel_advisor_tools,
    prompt=(
        "You are a hotel expert that can provide hotel recommendations for a given destination. "
        "If you need help picking travel destinations, ask 'travel_advisor' for help."
        "You MUST include human-readable response before transferring to another agent."
    ),
)


def call_hotel_advisor(
    state: MessagesState,
) -> Command[Literal["travel_advisor", "__end__"]]:
    return hotel_advisor.invoke(state)


builder = StateGraph(MessagesState)
builder.add_node("travel_advisor", call_travel_advisor)
builder.add_node("hotel_advisor", call_hotel_advisor)
# we'll always start with a general travel advisor
builder.add_edge(START, "travel_advisor")

graph = builder.compile()
display(Image(graph.get_graph().draw_mermaid_png()))
```

---

## Setting Up Network Multi-Agent Architecture with StateGraph in Python
DESCRIPTION: This Python code defines a network architecture using langgraph's `StateGraph`. It includes three agent nodes (`agent_1`, `agent_2`, `agent_3`) where each agent can decide the next step by returning a `Command` object, allowing transitions between any agent or to the graph's end. The code sets up the graph builder, adds the nodes, defines the initial edge from `START` to `agent_1`, and compiles the graph.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/concepts/multi_agent.md#_snippet_6
LANGUAGE: python
```python
from typing import Literal
from langchain_openai import ChatOpenAI
from langgraph.types import Command
from langgraph.graph import StateGraph, MessagesState, START, END

model = ChatOpenAI()

def agent_1(state: MessagesState) -> Command[Literal["agent_2", "agent_3", END]]:
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # to determine which agent to call next. a common pattern is to call the model
    # with a structured output (e.g. force it to return an output with a "next_agent" field)
    response = model.invoke(...)
    # route to one of the agents or exit based on the LLM's decision
    # if the LLM returns "__end__", the graph will finish execution
    return Command(
        goto=response["next_agent"],
        update={"messages": [response["content"]]}
    )

def agent_2(state: MessagesState) -> Command[Literal["agent_1", "agent_3", END]]:
    response = model.invoke(...)
    return Command(
        goto=response["next_agent"],
        update={"messages": [response["content"]]}
    )

def agent_3(state: MessagesState) -> Command[Literal["agent_1", "agent_2", END]]:
    ...
    return Command(
        goto=response["next_agent"],
        update={"messages": [response["content"]]}
    )

builder = StateGraph(MessagesState)
builder.add_node(agent_1)
builder.add_node(agent_2)
builder.add_node(agent_3)

builder.add_edge(START, "agent_1")
network = builder.compile()
```

---

## Full LangGraph Agent Code with Prebuilt Components (Python)
DESCRIPTION: Presents the complete code for the conversational agent graph, consolidating imports, state definition, tool and LLM setup, node creation using the prebuilt `ToolNode`, and graph construction with prebuilt `tools_condition` for conditional routing and defined edges.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/tutorials/introduction.ipynb#_snippet_19
LANGUAGE: python
```python
from typing import Annotated

from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langchain_core.messages import BaseMessage
from typing_extensions import TypedDict

from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition


class State(TypedDict):
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)


tool = TavilySearch(max_results=2)
tools = [tool]
llm = init_chat_model("anthropic:claude-3-5-sonnet-latest")
llm_with_tools = llm.bind_tools(tools)


def chatbot(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}


graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=[tool])
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
# Any time a tool is called, we return to the chatbot to decide the next step
graph_builder.add_edge("tools", "chatbot")
graph_builder.set_entry_point("chatbot")
graph = graph_builder.compile()
```

---

## Defining and Building Team 1 Graph in LangGraph
DESCRIPTION: Defines the supervisor and agent nodes for Team 1, using `MessagesState`. It then builds a `StateGraph` for this team, adding the nodes and defining the initial edge from `START` to the supervisor. The graph is compiled for execution.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/concepts/multi_agent.md#_snippet_9
LANGUAGE: python
```python
def team_1_supervisor(state: MessagesState) -> Command[Literal["team_1_agent_1", "team_1_agent_2", END]]:
    response = model.invoke(...)
    return Command(goto=response["next_agent"])

def team_1_agent_1(state: MessagesState) -> Command[Literal["team_1_supervisor"]]:
    response = model.invoke(...)
    return Command(goto="team_1_supervisor", update={"messages": [response]})

def team_1_agent_2(state: MessagesState) -> Command[Literal["team_1_supervisor"]]:
    response = model.invoke(...)
    return Command(goto="team_1_supervisor", update={"messages": [response]})

team_1_builder = StateGraph(Team1State)
team_1_builder.add_node(team_1_supervisor)
team_1_builder.add_node(team_1_agent_1)
team_1_builder.add_node(team_1_agent_2)
team_1_builder.add_edge(START, "team_1_supervisor")
team_1_graph = team_1_builder.compile()
```

---

## Implementing a Basic Supervisor Architecture in LangGraph
DESCRIPTION: This snippet demonstrates the fundamental supervisor pattern in LangGraph. It defines a supervisor node (an LLM) that decides which agent node ('agent_1' or 'agent_2') to call next based on the state, using the `Command(goto=...)` mechanism for routing. Agent nodes perform tasks and return control to the supervisor.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/concepts/multi_agent.md#_snippet_7
LANGUAGE: python
```python
from typing import Literal
from langchain_openai import ChatOpenAI
from langgraph.types import Command
from langgraph.graph import StateGraph, MessagesState, START, END

model = ChatOpenAI()

def supervisor(state: MessagesState) -> Command[Literal["agent_1", "agent_2", END]]:
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # to determine which agent to call next. a common pattern is to call the model
    # with a structured output (e.g. force it to return an output with a "next_agent" field)
    response = model.invoke(...)
    # route to one of the agents or exit based on the supervisor's decision
    # if the supervisor returns "__end__", the graph will finish execution
    return Command(goto=response["next_agent"])

def agent_1(state: MessagesState) -> Command[Literal["supervisor"]]:
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # and add any additional logic (different models, custom prompts, structured output, etc.)
    response = model.invoke(...)
    return Command(
        goto="supervisor",
        update={"messages": [response]},
    )

def agent_2(state: MessagesState) -> Command[Literal["supervisor"]]:
    response = model.invoke(...)
    return Command(
        goto="supervisor",
        update={"messages": [response]},
    )

builder = StateGraph(MessagesState)
builder.add_node(supervisor)
builder.add_node(agent_1)
builder.add_node(agent_2)

builder.add_edge(START, "supervisor")

supervisor = builder.compile()
```

---

## Agent Interaction and State Management
DESCRIPTION: Example of interacting with the agent to play a song and managing the resulting state.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/how-tos/human_in_the_loop/time-travel.ipynb#2025-04-22_snippet_3
LANGUAGE: python
```python
from langchain_core.messages import HumanMessage

config = {"configurable": {"thread_id": "1"}}
input_message = HumanMessage(content="Can you play Taylor Swift's most popular song?")
for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()
```

---

## Implementing a Tool-Calling Supervisor Architecture in LangGraph
DESCRIPTION: This snippet illustrates a supervisor pattern where individual agents are treated as tools callable by a tool-calling LLM acting as the supervisor. It leverages `langgraph.prebuilt.create_react_agent` to simplify the implementation, allowing agent functions to receive state via `Annotated[dict, InjectedState]` and return string responses which are automatically converted to `ToolMessage`.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/concepts/multi_agent.md#_snippet_8
LANGUAGE: python
```python
from typing import Annotated
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import InjectedState, create_react_agent

model = ChatOpenAI()

# this is the agent function that will be called as tool
# notice that you can pass the state to the tool via InjectedState annotation
def agent_1(state: Annotated[dict, InjectedState]):
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # and add any additional logic (different models, custom prompts, structured output, etc.)
    response = model.invoke(...)
    # return the LLM response as a string (expected tool response format)
    # this will be automatically turned to ToolMessage
    # by the prebuilt create_react_agent (supervisor)
    return response.content

def agent_2(state: Annotated[dict, InjectedState]):
    response = model.invoke(...)
    return response.content

tools = [agent_1, agent_2]
# the simplest way to build a supervisor w/ tool-calling is to use prebuilt ReAct agent graph
# that consists of a tool-calling LLM node (i.e. supervisor) and a tool-executing node
supervisor = create_react_agent(model, tools)
```

---

## Creating LangGraph Wrapper
DESCRIPTION: Wrapping the AutoGen agent in a LangGraph node and setting up the graph structure for deployment. Includes state management and message handling.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/how-tos/autogen-langgraph-platform.ipynb#2025-04-22_snippet_3
LANGUAGE: python
```python
from langgraph.graph import StateGraph, MessagesState


def call_autogen_agent(state: MessagesState):
    last_message = state["messages"][-1]
    response = user_proxy.initiate_chat(autogen_agent, message=last_message.content)
    # get the final response from the agent
    content = response.chat_history[-1]["content"]
    return {"messages": {"role": "assistant", "content": content}}


graph = StateGraph(MessagesState)
graph.add_node(call_autogen_agent)
graph.set_entry_point("call_autogen_agent")
graph = graph.compile()
```

---

## Defining Top-Level Supervisor and Orchestration Graph in LangGraph
DESCRIPTION: Defines the `top_level_supervisor` function responsible for routing between team graphs based on the state. It then builds the main `StateGraph`, adding the top-level supervisor node and the compiled team graphs as nodes. Edges are defined to route from `START` to the top supervisor and from each team graph back to the top supervisor.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/concepts/multi_agent.md#_snippet_11
LANGUAGE: python
```python
builder = StateGraph(MessagesState)
def top_level_supervisor(state: MessagesState) -> Command[Literal["team_1_graph", "team_2_graph", END]]:
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # to determine which team to call next. a common pattern is to call the model
    # with a structured output (e.g. force it to return an output with a "next_team" field)
    response = model.invoke(...)
    # route to one of the teams or exit based on the supervisor's decision
    # if the supervisor returns "__end__", the graph will finish execution
    return Command(goto=response["next_team"])

builder = StateGraph(MessagesState)
builder.add_node(top_level_supervisor)
builder.add_node("team_1_graph", team_1_graph)
builder.add_node("team_2_graph", team_2_graph)
builder.add_edge(START, "top_level_supervisor")
builder.add_edge("team_1_graph", "top_level_supervisor")
builder.add_edge("team_2_graph", "top_level_supervisor")
graph = builder.compile()
```

---

## Asserting Message History is Untouched (Python)
DESCRIPTION: Retrieves the current state of the graph after the streaming invocation. It then asserts that the message history stored in the graph state (`updated_messages`) is identical to the history before the last invocation (`messages`), confirming that the `pre_model_hook` only modified the LLM input, not the persistent state history.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/how-tos/create-react-agent-manage-message-history.ipynb#_snippet_14
LANGUAGE: python
```python
updated_messages = graph.get_state(config).values["messages"]
assert [(m.type, m.content) for m in updated_messages[: len(messages)]] == [
    (m.type, m.content) for m in messages
]
```

---

## Defining a Parent Graph for Multi-Agent Handoffs in Python
DESCRIPTION: Illustrates the basic structure of a `StateGraph` that will contain the individual agents as nodes, enabling control flow and handoffs between them. The parent graph orchestrates the interaction.
SOURCE: https://github.com/langchain-ai/langgraph/blob/main/docs/docs/agents/multi-agent.md#_snippet_6
LANGUAGE: python
```python
from langgraph.graph import StateGraph, MessagesState
multi_agent_graph = (
    StateGraph(MessagesState)
    .add_node(flight_assistant)
    .add_node(hotel_assistant)
    ...
)