<?php


namespace App\Model\Abstract;

abstract class AbstractAttribute
{
    protected string $name;
    protected string $type;
    protected array $items;

    public function __construct(array $data)
    {
        $this->name = $data['name'];
        $this->type = $data['type'];
        $this->items = $data['items'];
    }

    abstract public function render(): array;

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'type' => $this->type,
            'items' => $this->items
        ];
    }
}