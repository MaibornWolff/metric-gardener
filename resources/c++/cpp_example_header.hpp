#ifndef EXAMPLE_HEADER_98784856
#define EXAMPLE_HEADER_98784856

#include <chrono>
#include <string>
#include <memory>

#include "library/client.h"

/**
 * @brief Some abstract superclass.
 */
class Super_Class
{
  protected:
    /**
     * @brief Client.
     */
    std::shared_ptr<library::client> client;

    /**
     * @brief timeout in seconds.
     */
    int timeout_seconds;
    
  public:
    // Concrete constructor
    Super_Class(std::shared_ptr<library::client> client);

    // Abstract function
    virtual void send_message(const size_t number, const int retry) const = 0;
    
};

/**
 * A concrete class.
 */
class Concrete_Class final : public Super_Class
{
  private:

    std::string address;
    int port;

  public:

    /**
     * A constructor.
     */
    Concrete_Class(std::shared_ptr<library::client> client, std::string &address, int port);

    /**
     * Another constructor.
     */
    Concrete_Class(std::shared_ptr<library::client> client);


    virtual void send_message(const size_t number, const int retry) const override;

    std::chrono::steady_clock::duration send_timed_message(const size_t number, const int retry);

    void set_address(std::string address);
    void set_port(int port);

    std::string get_address();
    int get_port();

};

#endif
