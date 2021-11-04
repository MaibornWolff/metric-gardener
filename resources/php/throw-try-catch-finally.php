<?php

try {
    $fileHanlder = fopen("not_existing_file", "r");
    throw new \RuntimeException("another exception");
} catch (\Exception | \RuntimeException $exception) {
    return -1;
} finally {
    return 1;
}
