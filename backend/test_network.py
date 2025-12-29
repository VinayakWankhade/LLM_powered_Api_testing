import asyncio
import asyncpg
import socket

async def test_ports():
    host = "db.gkzdzxuvwtzxlfazuzxy.supabase.co"
    ports = [5432, 6543]
    
    print(f"Resolving {host}...")
    try:
        ip = socket.gethostbyname(host)
        print(f"Resolved to: {ip}")
    except Exception as e:
        print(f"❌ Failed to resolve host: {e}")
        return

    for port in ports:
        print(f"Testing TCP connection to {host}:{port}...")
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(host, port), 
                timeout=5.0
            )
            print(f"🚀 TCP connection to port {port} SUCCESSFUL!")
            writer.close()
            await writer.wait_closed()
        except Exception as e:
            print(f"❌ TCP connection to port {port} FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_ports())
