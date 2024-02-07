#include "cpp_example_header.hpp"

#include "library/client.h"

/*
 * Implementation of a abstract superclass.
 */

Super_Class::Super_Class(std::shared_ptr<library::client> client) : client(client)
{
}

/*
 * Implementation of a concrete class.
 */

Concrete_Class::Concrete_Class(std::shared_ptr<library::client> client, std::string &address, int port)
    : Super_Class(client), address(address), port(port)
{
}

Concrete_Class::Concrete_Class(std::shared_ptr<library::client> client)
    : Super_Class(client), address("127.0.0.1"), port(80)
{
}

void Concrete_Class::send_message(const size_t number, const int retry) const
{
    for (int i = 0; i < number; i++)
    {
        library::send_async(client, i, retry);
    }
}

std::chrono::steady_clock::duration Concrete_Class::send_timed_message(const size_t number, const int retry)
{
    auto start_time = std::chrono::steady_clock::now();
    auto answer = library::send_sync(client, number, retry);

#ifdef DEBUG
    std::cout << answer.message << std::endl;
#endif

    return std::chrono::steady_clock::now() - start_time;
}


void Concrete_Class::set_address(std::string address)
{
    this->address = std::move(address);
}

void Concrete_Class::set_port(int port)
{
    this->port = port;
}

std::string Concrete_Class::get_address()
{
    return this->address;
}

int Concrete_Class::get_port()
{
    return this->port;
}
