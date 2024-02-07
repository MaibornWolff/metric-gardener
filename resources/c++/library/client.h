#ifndef LIBRARY_HEADER_78934
#define LIBRARY_HEADER_78934

#include <memory>

namespace library{
    class client {
    };

    struct Answer {
    };

    Answer send_async(std::shared_ptr<client> client, int number, int retry);

    Answer send_sync(std::shared_ptr<client> client, int number, int retry);
}

#endif
