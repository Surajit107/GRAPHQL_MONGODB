import { Schema, Document, Model } from 'mongoose';

export interface BaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface BaseModel<T extends BaseDocument> extends Model<T> {
    findActive(): Promise<T[]>;
    softDelete(id: string): Promise<T | null>;
}

export const baseSchema = new Schema({
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Common static methods
export const baseStaticMethods = {
    findActive(this: Model<BaseDocument>) {
        return this.find({ isActive: true });
    },
    
    async softDelete(this: Model<BaseDocument>, id: string) {
        return this.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }
}; 