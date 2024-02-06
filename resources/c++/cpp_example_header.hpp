#ifndef EXAMPLE_HEADER_98784856
#define EXAMPLE_HEADER_98784856

#include <chrono>
#include <string>
#include <memory>

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
    virtual void send_message(const size_t number, const int retry) = 0;
    
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


    void send_message(const size_t number, const int retry) override;

    std::chrono::steady_clock::duration Concrete_Class::send_timed_message(const size_t number, const int retry);

    void set_address(std::string address);
    void set_port(int port);

    void get_address(std::string address);
    void get_port(int port);

};

#endif
