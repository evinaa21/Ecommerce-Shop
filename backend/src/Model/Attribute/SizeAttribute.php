<?php


namespace App\Model\Attribute;

use App\Model\Abstract\AbstractAttribute;

class SizeAttribute extends AbstractAttribute
{
    public function render(): array
    {
        // Size-specific rendering logic
        return $this->toArray();
    }
}