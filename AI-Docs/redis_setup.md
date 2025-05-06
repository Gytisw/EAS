# Redis Documentation Summary (Phase 0 Focus)

## Basic Usage & Concepts (redis-py)

*   **Installation:** `pip install redis`
*   **Connection:** Use the `redis-py` library to connect to your Redis instance.
    ```python
    import redis

    # Basic connection (localhost:6379)
    # decode_responses=True returns strings instead of bytes
    r = redis.Redis(decode_responses=True)

    # Connection with specific host/port/db
    # r = redis.Redis(host='your_redis_host', port=6379, db=0, decode_responses=True)

    # Connection using URL (Common for Celery)
    # r = redis.from_url('redis://your_redis_host:6379/0', decode_responses=True)

    # Verify connection
    try:
        r.ping()
        print("Successfully connected to Redis!")
    except redis.exceptions.ConnectionError as e:
        print(f"Could not connect to Redis: {e}")
    ```
*   **Basic Commands:**
    *   `r.set('mykey', 'Hello')`: Set a string value.
    *   `value = r.get('mykey')`: Get a string value.
    *   `r.incr('counter')`: Increment an integer key.
    *   `r.exists('mykey')`: Check if a key exists.
    *   `r.delete('mykey')`: Delete a key.
    *   `r.expire('mykey', 60)`: Set a timeout (in seconds) for a key.
*   **Data Structures:** Redis supports various data structures beyond simple strings:
    *   **Hashes:** `r.hset('user:1000', mapping={'name': 'John', 'surname': 'Smith'})`, `r.hgetall('user:1000')`
    *   **Lists:** `r.lpush('mylist', 'a', 'b')`, `r.rpop('mylist')`
    *   **Sets:** `r.sadd('myset', 'a', 'b')`, `r.smembers('myset')`
    *   **Sorted Sets:** `r.zadd('myzset', {'player1': 10, 'player2': 5})`, `r.zrange('myzset', 0, -1)`

## Integration with Celery (as Broker)

*   **Celery Configuration:** Set the `broker_url` in your Celery configuration (e.g., `celeryconfig.py` or Django `settings.py`) to point to your Redis instance.
    ```python
    # Example celeryconfig.py or settings.py
    broker_url = 'redis://localhost:6379/0' # Use DB 0 for broker
    result_backend = 'redis://localhost:6379/1' # Use a different DB for results
    ```
    *   **URL Format:** `redis://[:password@]hostname[:port][/database_number]`
    *   It's recommended to use separate Redis logical databases for the broker and the result backend to prevent potential key collisions.
*   **Dependencies:** Ensure you have the necessary Celery extras installed: `pip install celery[redis]`
*   **How it Works:** Celery uses Redis lists (by default) to queue tasks. Workers use blocking list pop commands (`BRPOP`) to efficiently wait for and retrieve tasks. Results (if using Redis as a backend) are typically stored using keys with expiration.

## Key Concepts & Links

*   **`redis-py`:** The standard Python client library for Redis.
*   **Logical Databases:** Redis supports multiple databases (0-15 by default), allowing separation of concerns (e.g., broker vs. result backend vs. application cache).
*   **Celery Broker URL:** The primary configuration setting linking Celery to Redis.
*   **Official Docs & Resources:**
    *   [Redis Official Website](https://redis.io/)
    *   [Redis Commands Reference](https://redis.io/commands/)
    *   [`redis-py` Documentation](https://redis-py.readthedocs.io/en/stable/)
    *   [Celery Brokers Overview](https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/index.html)
    *   [Using Redis as Celery Broker](https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/redis.html)